import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's team
    const userTeam = await prisma.userTeam.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!userTeam) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Get all team members
    const teamMembers = await prisma.userTeam.findMany({
      where: { teamId: userTeam.teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format the response
    const members = teamMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      status: member.status,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("[TEAM_MEMBERS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
