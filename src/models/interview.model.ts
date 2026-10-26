
import prisma from "../prisma.js";


export const createInterview = async (data: {
  applicationId: number;
  round: string;
  scheduledAt: Date;
  mode?: string;
  meetingLink?: string;
}) => {
  return await prisma.interview.create({
    data: {
      applicationId: data.applicationId,
      round: data.round,
      scheduledAt: data.scheduledAt,
      ...(data.mode !== undefined && { mode: data.mode }),
      ...(data.meetingLink !== undefined && {
        meetingLink: data.meetingLink,
      }),
    },
  });
};


export const getInterviews = async () => {
  return await prisma.interview.findMany({
    include: {
      application: {
        include: {
        user: {
  select: {
    id: true,
    name: true,
    email: true,
    rollNumber: true,
    branch: true,
    year: true,
  },
},
          placementDrive: {
            include: {
              company: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

export const getInterviewById = async (id: number) => {
  return await prisma.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          user: {
  select: {
    id: true,
    name: true,
    email: true,
    rollNumber: true,
    branch: true,
    year: true,
  },
},
          placementDrive: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  });
};

export const updateInterview = async (
  id: number,
  data: {
    applicationId: number;
    round: string;
    scheduledAt: Date;
    mode?: string;
    meetingLink?: string | null;
    status?: string;
    feedback?: string | null;
  }
) => {
  return await prisma.interview.update({
    where: { id },
    data,
  });
};

export const patchInterview = async (
  id: number,
  data: {
    applicationId?: number;
    round?: string;
    scheduledAt?: Date;
    mode?: string;
    meetingLink?: string | null;
    status?: string;
    feedback?: string | null;
  }
) => {
  return await prisma.interview.update({
    where: { id },
    data,
  });
};

export const deleteInterview = async (id: number) => {
  return await prisma.interview.delete({
    where: { id },
  });
};
