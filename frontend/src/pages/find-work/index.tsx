import React from "react";
import {useList} from "@refinedev/core";

function FindWork() {
  const {data: projects} = useList({resource:"projects"})
  return <div></div>;
}

export default FindWork;
