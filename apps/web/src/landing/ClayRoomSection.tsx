import { CLAY_ROOM_CAMERA, CLAY_ROOM_HORIZONTAL_FOV, ClayRoomScene } from "@/components/ui/ClayRoom";
import { SceneCanvas } from "@/components/ui/SceneCanvas";

/**
 * Landing section: copy on the left, a scene on the right.
 *
 * The section owns the words and the layout only. The scene is a separate
 * component mounted into a `SceneCanvas`, so a different scene is a different
 * child here and nothing in the section changes.
 *
 * The column order is copy first in the DOM at every breakpoint, so the reading
 * order is the same whether the grid is stacked or side by side.
 */
export function ClayRoomSection() {
  return (
    <section
      className="overflow-clip bg-paper px-6 py-20 lg:px-12"
      aria-labelledby="clay-room-heading"
    >
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <SceneCanvas
          label="A white clay room with a floating phone chained to a blue metal chain."
          className="h-[560px] w-full lg:h-[800px]"
          cameraPosition={CLAY_ROOM_CAMERA}
          cameraTarget={[-3.48, 9.0]}
          horizontalFov={CLAY_ROOM_HORIZONTAL_FOV}
        >
          <ClayRoomScene />
        </SceneCanvas>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{ background: "linear-gradient(to bottom, #F8F8F8 0%, rgba(248, 248, 248, 0) 100%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
          style={{ background: "linear-gradient(to top, #F8F8F8 0%, rgba(248, 248, 248, 0) 100%)" }}
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto grid h-full w-full max-w-[88rem] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:px-12">
            <div className="flex max-w-2xl flex-col justify-center">
              <h2 id="clay-room-heading" className="text-5xl font-bold leading-tight text-ink sm:text-6xl">
                A shortlist, not a list of links.
              </h2>
              <p className="mt-4 max-w-lg text-xl leading-relaxed text-[#1A1A19]/60">
                We read your pages, find the publications where they would genuinely be useful, and rank
                them by editorial fit. You get a room of prospects with the reasoning already in it, so
                you reach out knowing why each one fits.
              </p>
            </div>
            <div aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
