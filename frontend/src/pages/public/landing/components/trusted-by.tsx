import React from "react";
import { motion } from "framer-motion";

const TrustedBy = () => {
  const logos = [
    "https://cdn.prod.website-files.com/603fea6471d9d8559d077603/662e48b170078c42069a52c6_Microsoft.svg",
    "https://cdn.prod.website-files.com/603fea6471d9d8559d077603/662e48b170078c42069a5313_pngwing%201.svg",
    "https://cdn.prod.website-files.com/603fea6471d9d8559d077603/662e48b170078c42069a530e_Group%207384.svg",
    "https://cdn.prod.website-files.com/603fea6471d9d8559d077603/662e48b270078c42069a532a_Bissell_logo%202.svg",
    "https://cdn.prod.website-files.com/603fea6471d9d8559d077603/66d1badb0f2a04e5454c9255_6467fdfb5cf8b0504c7f3c1b_Cloudflare-Logo.wine-p-500.png",
  ];

  return (
    <div className="h-[40vh] bg-gray-50 py-8">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
        Trusted by
      </h2>

      <div className="relative overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: "fit-content" }}
        >
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <motion.div
              key={`logo-1-${index}`}
              className="mx-12 inline-flex"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src={logo}
                alt="trusted company logo"
                className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
              />
            </motion.div>
          ))}

          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <motion.div
              key={`logo-2-${index}`}
              className="mx-12 inline-flex"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src={logo}
                alt="trusted company logo"
                className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TrustedBy;
