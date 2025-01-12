import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateNextKwsId = async () => {
  try {
    // Default start number
    let nextIdNumber = 5000;

    // Fetch the latest KWS ID from the database
    let lastMember = await prisma.core_kwsmember.findFirst({
      where: {
        kwsid: {
          not: null,
        },
      },
      orderBy: {
        kwsid: "desc",
      },
    });

    if (lastMember && lastMember.kwsid) {
      const lastIdNumber = parseInt(lastMember.kwsid.replace("KWSKW", ""), 10);
      if (!isNaN(lastIdNumber)) {
        nextIdNumber = lastIdNumber + 1;
      }
    }

    let nextKwsId = `KWSKW${String(nextIdNumber).padStart(5, "0")}`;

    // Check if the generated KWS ID already exists in the database
    while (await prisma.core_kwsmember.findFirst({
      where: {
        kwsid: nextKwsId,
      },
    })) {
      nextIdNumber += 1;
      nextKwsId = `KWSKW${String(nextIdNumber).padStart(5, "0")}`;
    }

    // Return the unique KWS ID
    return nextKwsId;

  } catch (error) {
    console.error("Error generating next KWS ID:", error);
    throw new Error("Failed to generate the next KWS ID.");
  }
};