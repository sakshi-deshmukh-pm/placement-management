import { Prisma } from "../generated/prisma/client.js";
import prisma from "../prisma.js";
import type { ApplicationStatus } from "../generated/prisma/client.js";

export const createApplication = async (
    userId: number,
    placementDriveId: number
) => {
    return await prisma.application.create({
        data: {
            userId,
            placementDriveId
        }
    });
};


export const getApplications = async (
  userId?: number,
  page = 1,
  pageSize = 10,
  search = "",
  status?: ApplicationStatus,
) => {
  const where: Prisma.ApplicationWhereInput = {
    ...(userId !== undefined ? { userId } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(search.trim()
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
            },
            {
              user: {
                email: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
            },
            {
              placementDrive: {
                role: {
                  contains: search.trim(),
                  mode: "insensitive",
                },
              },
            },
            {
              placementDrive: {
                company: {
                  name: {
                    contains: search.trim(),
                    mode: "insensitive",
                  },
                },
              },
            },
            ...(Number.isInteger(Number(search.trim())) &&
            search.trim() !== ""
              ? [{ id: Number(search.trim()) }]
              : []),
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [applications, total] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        appliedAt: "desc",
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        placementDrive: {
          select: {
            id: true,
            role: true,
            package: true,
            deadline: true,
            company: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};



export const updateApplicationStatus = async (
    id: number,
    status: ApplicationStatus
) => {
    return await prisma.application.update({
        where: { id },
        data: { status }
    });
};

export const findEligiblePlacementDrive = async (
    placementDriveId: number
) => {
    const drive = await prisma.placementDrive.findUnique({
        where: { id: placementDriveId }
    });

    if (!drive) {
        return {
            eligible: false,
            reason: "Placement drive not found",
            statusCode: 404
        };
    }

    if (drive.status !== "OPEN") {
        return {
            eligible: false,
            reason: "This placement drive is not open",
            statusCode: 400
        };
    }

    if (drive.deadline <= new Date()) {
        return {
            eligible: false,
            reason: "The application deadline has passed",
            statusCode: 400
        };
    }

    return {
        eligible: true,
        drive
    };
};
