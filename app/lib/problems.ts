// "Chhoti problems, smart jugaad" — everyday home problems mapped to the product
// that helps. Copy describes what the product does; no time or performance claims.
import type { IconName } from "~/components/ui/Icon";

export type Problem = {
  handle: string;
  problem: string;
  fix: string;
  icon: IconName;
};

export const PROBLEMS: Problem[] = [
  {
    handle: "wall-repair-roller-paint-white-wall-repair-painting-solution-d7foign37jks73d5755g",
    problem: "Crayon art on the white wall?",
    fix: "Roll on a touch-up — paint and roller in one bottle.",
    icon: "roller",
  },
  {
    handle: "flexible-fan-duster-pack-of-1-db9htpljl7qs73beeb20",
    problem: "Dust on the fan blades. Again.",
    fix: "A bendable head that wraps around each blade.",
    icon: "sparkle",
  },
  {
    handle:
      "furniture-lifter-furniture-lifter-mover-tool-set-heavy-duty-furniture-shifting-lifting-moving-tool-with-wheel-pads-d75nj0r5qtns73a106pg",
    problem: "Almirah too heavy to clean behind?",
    fix: "Lift a corner, slide in a wheel, roll it out.",
    icon: "box",
  },
  {
    handle: "crack-filler-d70coae3iibs73dpd7tg",
    problem: "Dark gaps around the wash basin?",
    fix: "Run a neat white line straight from the tube.",
    icon: "home",
  },
  {
    handle: "floor-essential-wax-120-ml-each-pack-of-2-d6678ulb6hvc73f0c2s0",
    problem: "Wooden table looking dull and dry?",
    fix: "Wipe on beeswax polish, buff, and see the grain glow.",
    icon: "vase",
  },
  {
    handle: "rods-clips-hook-self-adhesive-pack-of-10-db34469p7mrc73e0fho0",
    problem: "Rented flat — no drilling allowed?",
    fix: "Stick-on holders for light rods and hooks.",
    icon: "hook",
  },
  {
    handle: "2-in-1-knife-sharpener-with-holder-d6c46e90sodc73c0epng",
    problem: "Knives blunt and lost in the drawer?",
    fix: "A wall holder with a sharpener built in.",
    icon: "utensils",
  },
  {
    handle: "magic-broom-sweeper-for-floor-cleaning-pack-of-1-d9i6ai0021qs73efa8f0",
    problem: "Water all over the bathroom floor?",
    fix: "One rubber-blade wiper, a few long strokes.",
    icon: "broom",
  },
];
