"use client";

import React, { useState, useEffect } from "react";

const QUOTES = [
  "Stay focused and keep every Salesforce workflow moving.",
  "May the Force be with your data.",
  "I am Iron Man... and this is my CRM.",
  "Winter is coming, but our tickets are closed.",
  "To infinity and beyond the SLA!",
  "Just keep swimming... through the backlog.",
  "I'll be back... after I clear this queue.",
  "Why so serious? It's just a deployment.",
  "Houston, we have a problem... but we're fixing it.",
  "You shall not pass... without proper permissions!",
  "Keep your friends close, and your databases closer.",
  "I see dead records. Let's clean them up.",
  "There's no place like Production.",
  "Hasta la vista, bugs.",
  "The first rule of IT club: Did you restart it?",
  "The second rule of IT club: Did you clear your cache?",
  "With great power comes great administrative responsibility.",
  "I feel the need... the need for speed (and query optimization).",
  "Say hello to my little script!",
  "Nobody puts database in a corner.",
  "May the odds be ever in your pipeline's favor.",
  "You're gonna need a bigger server.",
  "Life is like a box of tickets. You never know what you're gonna get.",
  "Here's looking at you, code.",
  "I love the smell of deployed code in the morning.",
  "E.T. phone the helpdesk.",
  "Show me the data!",
  "You can't handle the truth... of these analytics!",
  "I'm the king of the network!",
  "My precious... database backups.",
  "A wizard is never late, nor is his cron job.",
  "I have a bad feeling about this deployment.",
  "This is the way. (To write clean code).",
  "I have spoken. The PR is approved.",
  "Bazinga! Bug fixed.",
  "That's what she said... about the server load.",
  "Pivot! Pivot! Pivot the data table!",
  "How you doin'? (Checking server health).",
  "We were on a break! (Server downtime).",
  "Could this query BE any slower?",
  "It's gonna be legen... wait for it... dary deployment.",
  "Challenge accepted! Resolving P1 issue.",
  "Suit up! It's time to code.",
  "Have you tried turning it off and on again?",
  "I'm disabled! (My account is locked).",
  "A Lannister always backs up his data.",
  "Chaos isn't a pit. Chaos is a poorly structured database.",
  "The North remembers... and so does our audit log.",
  "You know nothing, junior developer.",
  "I am the one who knocks... out these tickets.",
  "Yeah, Science! (Data science, that is).",
  "Better Call Support!",
  "Clear eyes, full coffee cups, can't lose.",
  "Treat yo self... to a fast query.",
  "Parks and Recreation... more like Queries and Optimization.",
  "I am Beyoncé, always. (And so is my code).",
  "Identity theft is not a joke, Jim! Use 2FA.",
  "Bears. Beets. Battlestar Galactica. Backups.",
  "That's a future Homer problem.",
  "D'oh! Syntax error.",
  "Excellent. (Mr. Burns looking at a clean pipeline).",
  "To alcohol! The cause of, and solution to, all of life's coding problems.",
  "Wubba lubba dub dub! (Debugging mode).",
  "Look at me, I'm the Admin now.",
  "I understood that reference. (Reading the documentation).",
  "I can do this all day. (Fixing UI bugs).",
  "That's my secret, Cap. I'm always caffeinated.",
  "We have a Hulk. (And a massive database).",
  "Perfectly balanced, as all systems should be.",
  "I don't feel so good... (Server under load).",
  "Reality can be whatever I code it to be.",
  "I am inevitable. (The deadline).",
  "This is fine. (Room on fire, server crashing).",
  "I'm not saying it was aliens, but it was a DNS issue.",
  "One does not simply deploy to production on a Friday.",
  "Shut up and take my money! (Paying for more cloud storage).",
  "Why not Zoidberg? (For your avatar).",
  "Good news, everyone! The build passed.",
  "Bite my shiny metal server rack.",
  "It's over 9000! (Lines of code).",
  "Pika-Pika! (Shockingly fast load times).",
  "Gotta catch 'em all! (The bugs).",
  "Do or do not. There is no try-catch block.",
  "Help me, Stack Overflow, you're my only hope.",
  "These aren't the bugs you're looking for.",
  "I find your lack of tests disturbing.",
  "It's a trap! (Infinite loop).",
  "Never tell me the odds (of this compiling on the first try).",
  "Let the code flow through you.",
  "I am your Father... (The parent component).",
  "Nooooo! (When the database drops).",
  "Luke, use the Source.",
  "Live long and prosper (without downtime).",
  "Beam me up, Scotty. The server is dead.",
  "Resistance is futile. You will be refactored.",
  "Make it so. (Approving the PR).",
  "Dammit Jim, I'm a developer, not a miracle worker!",
  "Fascinating... this bug makes no sense.",
  "Engage! (Starting the build pipeline).",
  "The needs of the many outweigh the needs of the few."
];

export function TypewriterQuotes() {
  // Start with the first quote fully typed out to prevent hydration mismatch
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(QUOTES[0]?.length || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (!isMounted) return;

    if (index === QUOTES.length) {
      setIndex(0);
      return;
    }

    if (subIndex === (QUOTES[index]?.length || 0) + 1 && !isDeleting) {
      const timer = setTimeout(() => setIsDeleting(true), 4000); // Wait 4s before deleting
      return () => clearTimeout(timer);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % QUOTES.length);
      return;
    }

    const delay = isDeleting 
      ? 15 // Fast delete
      : 35 + Math.random() * 25; // Variable typing speed

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, isMounted]);

  // Before hydration, render the first quote statically
  if (!isMounted) {
    return (
      <span className="min-h-[28px] inline-block font-medium">
        {QUOTES[0]}
      </span>
    );
  }

  return (
    <span className="min-h-[28px] inline-block font-medium">
      {(QUOTES[index] || "").substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 font-black text-blue-500`}>|</span>
    </span>
  );
}
