import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { email, role } = data;

    // Verify the inviter is an admin
    const userTeam = await prisma.userTeam.findFirst({
      where: {
        userId: session.user.id,
        role: "ADMIN",
      },
      include: { team: true },
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: "Only admins can send invitations" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Check if user is already in the team
    if (existingUser) {
      const existingMember = await prisma.userTeam.findFirst({
        where: {
          userId: existingUser.id,
          teamId: userTeam.teamId,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a team member" },
          { status: 400 }
        );
      }
    }

    // Create or update user and team membership
    const result = await prisma.$transaction(async (tx) => {
      let userId = existingUser?.id;

      if (!userId) {
        // Create new user if doesn't exist
        const newUser = await tx.user.create({
          data: {
            email,
            emailVerified: null,
          },
        });
        userId = newUser.id;
      }

      // Create team membership
      await tx.userTeam.create({
        data: {
          userId,
          teamId: userTeam.teamId,
          role,
          status: "PENDING",
        },
      });

      return { userId };
    });

    // TODO: Send invitation email
    // This would typically involve sending an email with a signup/accept invitation link

    return NextResponse.json({
      message: "Invitation sent successfully",
      userId: result.userId,
    });
  } catch (error) {
    console.error("[TEAM_INVITE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
