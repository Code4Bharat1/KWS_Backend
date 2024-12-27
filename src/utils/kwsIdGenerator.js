import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateNextKwsId = async () => {
  try {
    // Fetch the latest KWS ID from the database
    const lastMember = await prisma.core_kwsmember.findFirst({
      where: {
        kwsid: {
          not: null,
        },
      },
      orderBy: {
        kwsid: "desc",
      },
    });

    let nextIdNumber = 5000; // Default start number
    if (lastMember && lastMember.kwsid) {
      const lastIdNumber = parseInt(lastMember.kwsid.replace("KWSKW", ""), 10);
      if (!isNaN(lastIdNumber)) {
        nextIdNumber = lastIdNumber + 1;
      }
    }

    // Generate the new KWS ID
    const nextKwsId = `KWSKW${String(nextIdNumber).padStart(5, "0")}`;
    return nextKwsId;
  } catch (error) {
    console.error("Error generating next KWS ID:", error);
    throw new Error("Failed to generate the next KWS ID.");
  }
};
