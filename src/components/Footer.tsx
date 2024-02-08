import GithubIcon from "./GithubIcon";

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
          <GithubIcon
            title="gta-v-guessr"
            target="_blank"
            href="https://github.com/WilliamDavidson-02/gta-v-guessr"
            className="h-7 w-7 rounded p-1 transition-colors duration-300 hover:bg-accent"
          />
        </div>
      </div>
    </footer>
  );
}
