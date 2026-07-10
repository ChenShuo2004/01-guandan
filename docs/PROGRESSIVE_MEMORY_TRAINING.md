# Progressive Observer Memory Training

The current memory-training flow stays on the existing route:

/practice -> /practice/[practiceId] -> MemoryTrainingExperience -> GameArena(observerMode)

Each hand starts with one target rank and progresses through:

1 -> 2 -> 3 -> 5 -> 7 -> 10

The bottom seat is the first-person observer seat. Its hand remains visible, but
all four seats are driven by the existing game engine and AI action loop. The
observer mode does not expose card selection, play, pass, tip, pause, skip, or
AI-decision controls.

At a safe checkpoint, AI actions pause while the user enters the confirmed
quantity for every target rank. The answer is calculated from the union of
unique physical card IDs found in the initial observer hand and public play
history. Feedback shows each rank independently and replays only recorded
events relevant to incorrect ranks.

Training state is client-side and ephemeral. It does not add a route, database,
authentication, cloud persistence, strategy analysis, or a real AI service.
