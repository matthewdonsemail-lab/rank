import AsciiModelViewer from "@/components/ui/3d-ascii-model-viewer";

const settings = {
  resolution: 0.22,
  characters: " .:-=+*#%@",
  userScale: 1,
  fgColor: "#ffffff",
  bgColor: "#007BE5",
  invert: false,
};

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-screen w-screen">
      <AsciiModelViewer {...s} />
    </div>
  );
}
