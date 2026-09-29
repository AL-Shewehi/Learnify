import {
  CtaSection,
  FeaturedCoursesSection,
  HeroSection,
  QuoteBand,
  SubjectIndexSection,
  WhySection,
} from "@/features/landing";

export const metadata = {
  title: "Learnify — Learn Anything, Anywhere",
  description:
    "Modern learning platform with expert-led courses in programming, design, and more.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCoursesSection />
      <QuoteBand />
      <SubjectIndexSection />
      <WhySection />
      <CtaSection />
    </>
  );
}
