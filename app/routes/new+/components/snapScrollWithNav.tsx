import { useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Flex } from "~/buildingBlockComponents/mainContainers";
import MainIndexContainer from "~/routes/building/mainIndexContainer";
import SnapScrollSlideInContainer from "./snapScrollSlideInContainer";
import { motion } from "framer-motion";

export interface SnapScrollPanelProps {
  id: string;
  emoji: string;
  content: React.ReactNode;
  slideDirection: string;
}

export default function SnapScrollWithNav({
  panels,
}: {
  panels: SnapScrollPanelProps[];
}) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  type SectionId = keyof typeof sectionRefs.current;

  const location = useLocation();
  const [currentHash, setCurrentHash] = useState(location.hash || "#one");

  // Create a ref to hold the latest currentHash
  const currentHashRef = useRef(currentHash);

  // Update the ref whenever currentHash changes
  useEffect(() => {
    currentHashRef.current = currentHash;
  }, [currentHash]);

  useEffect(() => {
    const sections = Object.values(sectionRefs.current).filter(
      (section): section is HTMLDivElement => section !== null
    );

    const observerOptions: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.6, // 60% of the section is visible
    };

    const observerCallback = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionId;
          // Use the ref to get the latest hash
          if (currentHashRef.current !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
            setCurrentHash(`#${id}`);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []); // Run only once on mount

  useEffect(() => {
    // Update currentHash when location.hash changes
    setCurrentHash(location.hash || "#one");
  }, [location.hash]);

  function NavButton({ id, emoji }: { id: string; emoji: string }) {
    const isCurrent = currentHash === id;

    const handleClick = () => {
      const section = document.querySelector(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", id); // Update the hash without triggering a full navigation
      }
    };

    return (
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`text-lg flex justify-center items-center ${
          isCurrent
            ? "bg-rose-300 w-5.5vh h-5.5vh"
            : "bg-slate-300 w-4.5vh h-4.5vh"
        } rounded-full border-900-sm shadowNarrowTight cursor-pointer`}
      >
        {emoji}
      </motion.div>
    );
  }
  return (
    <>
      <Flex className="flex-col gap-4vh h-fit fixed right-0.5vh top-1/4 z-10 items-center">
        {panels.map((panel) => (
          <NavButton key={panel.id} id={`#${panel.id}`} emoji={panel.emoji} />
        ))}
      </Flex>
      <MainIndexContainer className="snap-y snap-mandatory" height="h-100svh">
        {panels.map((panel) => (
          <SnapScrollSlideInContainer
            height="h-100svh"
            key={panel.id}
            slideDirection={panel.slideDirection as "left" | "right"}
            id={panel.id}
            ref={(el) => (sectionRefs.current[panel.id as SectionId] = el)}
            className="snap-start"
          >
            {panel.content}
          </SnapScrollSlideInContainer>
        ))}
      </MainIndexContainer>
    </>
  );
}