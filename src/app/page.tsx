import { listAllFiles } from "@/server/modules/uploadThing";
// import { getSharePointFiles } from "../server/modules/sharepoint";
import GetSharePointFiles from "./rfp/SharePointFiles";
import { File } from "@/types";
// import { Assistant } from "./assistant"

export default async function Home() {
	// const sharePointFiles = await getSharePointFiles();
  const allFiles = (await listAllFiles()) as unknown as File[];
  console.log({ allFiles });

	return (
		<main className="m-10">
			<h1 className="font-bold text-3xl text-center py-10">Z BIDS</h1>
			<GetSharePointFiles files={allFiles} />
      {/* <Assistant /> */}
		</main>
	);
}
