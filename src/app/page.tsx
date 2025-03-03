import { getSharePointFiles } from "./modules/sharepoint";
import GetSharePointFiles from "./rfp/SharePointFiles";

export default async function Home() {
	const sharePointFiles = await getSharePointFiles();

	return (
		<div>
			<h1 className="font-bold text-3xl text-center">Z BIDS</h1>
			<GetSharePointFiles files={sharePointFiles} />
		</div>
	);
}
