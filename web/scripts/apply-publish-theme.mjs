import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "src/app/modules/publish/pages");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, "utf8");

  if (c.includes("useAppTheme")) {
    continue;
  }

  if (!c.includes("#4417E6") && !c.includes("#5A32F0")) {
    continue;
  }

  const lastImport = c.lastIndexOf("import ");
  const endLine = c.indexOf("\n", lastImport);
  c =
    c.slice(0, endLine + 1) +
    "import { useAppTheme } from \"../../../../theme/useAppTheme\";\n" +
    c.slice(endLine + 1);

  c = c.replace(
    /export default function (\w+)\(\) \{\n/,
    "export default function $1() {\n  const theme = useAppTheme();\n",
  );

  c = c.replace(
    /"linear-gradient\(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%\)"/g,
    "theme.heroGradient",
  );
  c = c.replace(/#3510B8/g, "theme.primaryDark");
  c = c.replace(/#4417E6/g, "theme.primary");
  c = c.replace(/rgba\(68,23,230/g, "rgba(197,46,62");

  fs.writeFileSync(fp, c);
  console.log("updated", file);
}
