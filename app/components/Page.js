import React, { useEffect } from "react";
import Container from "./Container";

function Page(props) {
  //update page title only once time when component is rendered
  useEffect(() => {
    document.title = `${props.title} | React App`;
    window.scrollTo(0, 0);
  }, []);
  return <Container>{props.children}</Container>;
}

export default Page;
