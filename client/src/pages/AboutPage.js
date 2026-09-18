import React, { useState } from 'react';
import '../index.css';
import tbr3logo from '../assets/tbr3.png';

const people = [
  {
    name: 'Mohammad I Al-Majali',
    role: 'Back-End Developer',
    linkedinUrl: 'https://linkedin.com/in/mavisverm',
  },
  {
    name: 'Marah Y AL-Qunbor',
    role: 'Front-End Developer-designing',
    linkedinUrl: 'https://www.linkedin.com/in/marahyousef',
  },
  {
    name: 'Manar M Abu-Irsheid ',
    role: 'Front-End Developer',
    linkedinUrl: 'https://www.linkedin.com/in/manar-abu-irsheid-06b352325',
  },
  {
    name: 'Rama F Al-Odat',
    role: 'Back-End developer',
    linkedinUrl: 'https://www.linkedin.com/in/rama-alodat-686aa932a/',
  },
  {
    name: 'Mohammed O AL-Bzoor',
    role: 'Front-End Developer',
    linkedinUrl: 'https://www.linkedin.com/in/mohammed-al-bzoor-774b12329/',
  },
];

export default function AboutPage() {
  const [message, setMessage] = useState('');

  // Split people into two rows
  const firstRow = people.slice(0, 3);
  const secondRow = people.slice(3);

  return (
    <section className="bg-gray-100 min-h-screen px-4">
      {/* Team Section */}
      <section className="max-w-6xl mx-auto mb-20 mt-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-semibold text-red-700">Meet Our Team</h1>
          <p className="mt-2 text-grey-600 text-lg">Passionate minds behind TBR3</p>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {firstRow.map((person, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transform transition duration-500 ease hover:bg-green-700 hover:shadow-lg hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white">{person.name}</h3>
              <p className="text-green-700 mt-2 text-sm group-hover:text-gray-200 ">{person.role}</p>
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-green-600 group-hover:text-zinc-400 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0zM7.06 20.45H3.56V9h3.5v11.45zM5.31 7.42a2.02 2.02 0 1 1 0-4.04 2.02 2.02 0 0 1 0 4.04zM20.45 20.45h-3.5v-5.8c0-1.38-.02-3.16-1.93-3.16-1.94 0-2.24 1.51-2.24 3.06v5.9h-3.5V9h3.36v1.56h.05c.47-.89 1.62-1.83 3.34-1.83 3.57 0 4.23 2.35 4.23 5.41v6.31z" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Second Row (Centered) */}
        <div className="flex justify-center gap-6 flex-wrap">
          {secondRow.map((person, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transform transition duration-500 ease hover:bg-green-700 hover:shadow-lg hover:scale-105 w-full sm:w-1/2 lg:w-1/3"
            >
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white">{person.name}</h3>
              <p className="text-green-700 mt-2 text-sm group-hover:text-gray-200 ">{person.role}</p>
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-green-600 group-hover:text-zinc-400 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0zM7.06 20.45H3.56V9h3.5v11.45zM5.31 7.42a2.02 2.02 0 1 1 0-4.04 2.02 2.02 0 0 1 0 4.04zM20.45 20.45h-3.5v-5.8c0-1.38-.02-3.16-1.93-3.16-1.94 0-2.24 1.51-2.24 3.06v5.9h-3.5V9h3.36v1.56h.05c.47-.89 1.62-1.83 3.34-1.83 3.57 0 4.23 2.35 4.23 5.41v6.31z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-red-700 w-full py-12 px-6 mb-10 rounded-lg pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-24">
          <div>
            <h1 className="text-4xl font-semibold text-white mb-9">About Us</h1>
            <p className="text-zinc-100 text-lg leading-loose text-center  ">
              We are five students from the College of Technology at Al al-Bayt University   <br />from different majors but
              united by one goal.
              <br />
              To help people and protect our environment. We created a website to encourage recycling and donating items
              we no longer need
              <br />
              giving them a new chance to benefit others and keep the Earth clean.
              <br />
              We believe every small action makes a big difference and we work together to make a real impact.
            </p>
          </div>
          <div className="flex justify-center md:justify-center md:min-w-fit pt-10">
            <img
              src="/images/uni.jpg"
              alt="uni pic"
              className="rounded-3xl shadow-lg w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>
    </section>
  );
}



