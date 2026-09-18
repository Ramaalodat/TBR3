/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        bannerImg: "url(/public/bg2.gif)",
        phoneimg: "url(/public/smbg.gif)",
        tabletimg: "url(/public/md.gif)",
        contimg: "url(/public/paper.jpg)",
       forarabic: "url(/public/bg3.gif)",
      },
      fontFamily: {
        bitter: ['Bitter', 'serif'],
      },
    },
  },
  plugins: [],
};
