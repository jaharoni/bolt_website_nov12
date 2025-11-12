// /app/pages/_layout.jsx


import { useEffect } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";


const pageTransition = {
initial: { opacity: 0, y: 40 },
animate: { opacity: 1, y: 0 },
exit: { opacity: 0, y: -40 },
transition: { duration: 0.4, ease: "easeInOut" }
};


export default function Layout({ children }) {
const router = useRouter();


useEffect(() => {
document.body.style.overflowX = "hidden";
}, []);


return (
<>
<Navbar />
<AnimatePresence mode="wait">
<motion.main
key={router.pathname}
initial={pageTransition.initial}
animate={pageTransition.animate}
exit={pageTransition.exit}
transition={pageTransition.transition}
className="px-4 md:px-8 pt-16"
>
{children}
</motion.main>
</AnimatePresence>
</>
);
}