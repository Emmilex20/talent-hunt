import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const db = getSupabaseAdmin();
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!accessToken) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { data: authData, error: authError } = await db.auth.getUser(accessToken);
    if (authError || !authData.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const { data: profile } = await db.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { applicationId, status } = await request.json();
    const allowed = ["pending", "shortlisted", "approved", "rejected"];
    if (!applicationId || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid application decision." }, { status: 400 });
    }

    const { data: application, error: applicationError } = await db.from("applications").select("*").eq("id", applicationId).maybeSingle();
    if (applicationError) throw applicationError;
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    let contestant = null;
    if (status === "approved") {
      const { data: existing, error: existingError } = await db.from("contestants").select("*").eq("application_id", applicationId).maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        contestant = existing;
      } else {
        const contestantPayload = {
          application_id: applicationId,
          full_name: application.full_name,
          stage_name: application.stage_name,
          category: application.category,
          bio: application.bio,
          photo_url: application.photo_url || null,
          video_url: application.video_url,
          active: true
        };
        const { data: created, error: createError } = await db.from("contestants").insert(contestantPayload).select("*").single();
        if (createError) throw createError;
        contestant = created;
      }
    }

    const { error: updateError } = await db.from("applications").update({ status, updated_at: new Date().toISOString() }).eq("id", applicationId);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, status, contestant });
  } catch (error) {
    console.error("application-decision", error);
    return NextResponse.json({ error: "Unable to update this application." }, { status: 500 });
  }
}
