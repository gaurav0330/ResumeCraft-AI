import { readFileSync } from "fs";
import path from "path";

const __dirname = path.resolve();

export default [
  readFileSync(path.join(__dirname, "src/graphql/schema/auth.graphql"), "utf8"),
  readFileSync(path.join(__dirname, "src/graphql/schema/resume.graphql"), "utf8"),
  readFileSync(path.join(__dirname, "src/graphql/schema/jobDescription.graphql"), "utf8"),
];
