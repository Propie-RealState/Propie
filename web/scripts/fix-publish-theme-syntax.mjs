import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "src/app/modules/publish/pages");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, "utf8");

  if (!c.includes("theme.primary")) {
    continue;
  }

  c = c.replace(/color="theme\.primary"/g, "color={theme.primary}");
  c = c.replace(/color: "theme\.primary"/g, "color: theme.primary");
  c = c.replace(/background: "theme\.primary"/g, "background: theme.primary");
  c = c.replace(/"2px solid theme\.primary"/g, "`2px solid ${theme.primary}`");
  c = c.replace(/\? "theme\.primary"/g, "? theme.primary");
  c = c.replace(/: "theme\.primaryDark"/g, ": theme.primaryDark");
  c = c.replace(/\.style\.(\w+) = "theme\.primary"/g, ".style.$1 = theme.primary");
  c = c.replace(/\.style\.(\w+) = "theme\.primaryDark"/g, ".style.$1 = theme.primaryDark");
  c = c.replace(/b\.style\.(\w+) = "theme\.primary"/g, "b.style.$1 = theme.primary");
  c = c.replace(/b\.style\.(\w+) = "theme\.primaryDark"/g, "b.style.$1 = theme.primaryDark");
  c = c.replace(/"theme\.primaryDark"/g, "theme.primaryDark");
  c = c.replace(/"theme\.primary"/g, "theme.primary");

  fs.writeFileSync(fp, c);
  console.log("fixed", file);
}
