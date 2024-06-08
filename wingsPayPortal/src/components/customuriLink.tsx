// components/CustomLink.tsx
import React from "react";

interface CustomLinkProps {
  uri: string;
  children: React.ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({ uri, children }) => {
  return (
    <a href={uri} onClick={(e) => handleCustomUriClick(e, uri)}>
      {children}
    </a>
  );
};

const handleCustomUriClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  uri: string
) => {
  console.log(`Navigating to custom URI: ${uri}`);
  // Add any custom logic before navigation
  // For example, you could do some validation or logging
  // Optionally, you can prevent default action
  // e.preventDefault();
};

export default CustomLink;
