import React from "react";

interface OpenFolderIconProps {
	className?: string;
}

export const OpenFolderIcon: React.FC<OpenFolderIconProps> = ({
	className = "text-blue-500",
}) => {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
				fill="currentColor"
				fillOpacity="0.2"
			/>

			<path
				d="M3 9C3 7.89543 3.89543 7 5 7H19C20.6569 7 22 8.34315 22 10L20 19H4L2 10C2 9.44772 2.44772 9 3 9Z"
				fill="currentColor"
				fillOpacity="0.2"
			/>

			<path
				d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			<path
				d="M2 10C2 9.44772 2.44772 9 3 9H21C21.5523 9 22 9.44772 22 10L20 19H4L2 10Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};
