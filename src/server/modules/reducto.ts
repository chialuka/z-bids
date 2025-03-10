import axios from "axios";

export const parseFile = async ({ documentUrl }: { documentUrl: string }) => {
  try {
    console.log(process.env.REDUCTO_API_KEY, "the reducto api key");
    const file = await axios({
      url: "https://platform.reducto.ai/parse",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REDUCTO_API_KEY}`,
      },
      data: {
        document_url: "https://pa6rt2x38u.ufs.sh/f/4o4hdZi2cLBoNyUss4SEBa4kdGCJl1UK89s5XR0tASPiLoOm"
      }
    });

    console.log({ file });
    return file;
  } catch (error) {
    console.error(error);
    return error;
  }
}
