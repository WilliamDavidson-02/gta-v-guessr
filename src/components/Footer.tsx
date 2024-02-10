import GithubIcon from "./GithubIcon";
import ThemeSelect from "./ThemeSelect";

export default function Footer() {
  return (
    <footer className="mt-16 border border-transparent border-t-border p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-border">
            Built by{" "}
            <a
              className="font-semibold text-primary"
              href="https://github.com/WilliamDavidson-02"
              target="_blank"
            >
              WilliamDavidson-02
            </a>
          </p>
          <div className="flex items-center gap-2">
            <GithubIcon
              title="gta-v-guessr"
              target="_blank"
              href="https://github.com/WilliamDavidson-02/gta-v-guessr"
              className="h-10 w-10 rounded p-2 transition-colors duration-300 hover:bg-accent"
            />
            <ThemeSelect />
          </div>
        </div>
      </div>
    </footer>
  );
}
