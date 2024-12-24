import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify the requester is an admin
    const userTeam = await prisma.userTeam.findFirst({
      where: {
        userId: session.user.id,
        role: "ADMIN",
      },
      include: { team: true },
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: "Only admins can remove team members" },
        { status: 403 }
      );
    }

    // Get the member to remove
    const memberToRemove = await prisma.userTeam.findFirst({
      where: {
        userId: id,
        teamId: userTeam.teamId,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Prevent removing yourself
    if (memberToRemove.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Remove the team member
    await prisma.userTeam.delete({
      where: {
        id: memberToRemove.id,
      },
    });

    return NextResponse.json({ message: "Team member removed successfully" });
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
