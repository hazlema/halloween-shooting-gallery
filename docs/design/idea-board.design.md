# Shooting-Gallery

_Exported 2026-10-28 from idea board._

## Brief

### What we're building

A Halloween carnival shooting gallery. The player aims at moving spooky targets in a booth, keeps a hit streak going for a score multiplier, and shoots haloed prize targets for three powerups: Spectral Slug, Candy Buckshot and Moonstruck. The crowd's cheer is the only meter; when it empties the night ends. Screens: Title, Main game (with a Pause overlay), Results.

### Open Questions

- Should the four stamps have bronze, silver and gold tiers earned by repeating each feat across different shows, with progress shown on Results?
- Stamps: is each one a goal a player can steer toward rather than luck? Log how often the streak reaches 6-7 and 10 on 44-58% runs. Pre-registered triggers (Systems): if 58% runs reach a streak of 10 on fewer than one night in ten, the multiplier cap drops from 10 to 8; if they reach it on more than one night in four, the cap rises from 10 to 12. Prize Parade tightens if the median player earns it on more than one night in three.
- Sample size, QA's proposal for the host to accept or change: 30 nights per accuracy band (44% and 58%), from at least 5 players with no more than 6 nights each; 5 first-time touch players, one or two nights each; about 5 nights for night length and escapes. A fixed-accuracy bot can estimate Hot Streak odds, but not Prize Parade or Ghost Train, because those depend on the player steering.
- Now that a bat escape is free and a bat hit pays a premium, do players who hold streaks of 6 or more still shoot bats? The premium is judged on those players, not the median night.
- Touch test with a first-time touch player: offset crosshair, tap to fire, drag to cancel, reaching a streak of 5. This is the biggest untested risk. Also ask what they thought happened when a Buckshot fan felled targets but halved the streak.
- Moonstruck no longer claims to rescue: it is a breather, and on the current grid a median player's haloes all come before act three. Is a mid-show breather still worth chasing, or should the bat halo be scheduled late?
- Escapes are still about 17 a minute. Is that tense, or does it feel like the booth is outrunning the player?
- Is Ghost Train (one Slug burst felling 8 targets) reachable by steering, as intended?
- Does the act-3 ramp end strong players' shows at a satisfying moment, not abruptly?
- Can a new player say why they lost after the first night?

### Premise

Step up to a haunted carnival shooting gallery where spooky targets sweep across the booth and impossible powerups turn trick shots into spectacle. The attraction is playful, not sinister: the carnival wants to put on a show with you.

### Tone and targets

A mischievous Halloween fairground: creaky painted scenery, theatrical scares and punchy, cartoonish reactions. Targets are drifting sheet ghosts, bouncing jack-o'-lanterns and swooping bats; their distinct silhouettes and movement make the booth feel alive.

Act marquee cues:
- Act one: “Step right up—the crowd is easy to please!”
- Act two: “The crowd wants sharper shooting!”
- Act three: “Final act—the crowd’s patience is running out!”

### Rules: the booth and the crowd

The loop: aim at the moving spooks, fire, and keep the streak clean. The crowd's cheer is the clock, the ammo and the ending.

Aim and fire
- Mouse: the crosshair is under the cursor; a click fires there.
- Touch: if the finger never moves beyond the drag threshold, releasing inside the booth fires at the release point; holding still does not turn a tap into a drag. Releasing outside the booth cancels a tap.
- Once movement exceeds the drag threshold, a crosshair shows above the finger. Releasing inside the booth or its lower aiming area fires at the crosshair. The crosshair is clamped to the booth's edges, so moving the finger near the top reaches the top edge.
- A touch area below the booth lets the finger reach the bottom edge with the crosshair. A touch that starts in that area begins as a drag.
- Marked drag-cancel strips sit outside the booth on both sides, alongside the booth and its lower aiming area. Releasing in either strip, above the booth including over the HUD, or below the lower aiming area cancels without firing; moving back into the booth or lower aiming area restores the aim. An interrupted touch cancels without firing. A second finger is ignored while one is down.
- One shot per click or release. No ammo and no reload: a shot's only cost is the crowd's patience.
- A shot is a hit anywhere on a target's painted shape, plus a single forgiveness margin that is the same in every act. One shot destroys that target. Later acts are harder only because the targets move and arrive faster.

Hits and escapes
- A target that leaves the booth without being hit is an escape. A ghost or a pumpkin that escapes costs cheer and never touches the streak. A bat is the exception: a bat that leaves the booth costs nothing at all, so letting a bat go is a choice the player is allowed to make and never a mistake on its own.
- That is what makes the three targets different. Few players hit every target, so a ghost or pumpkin escape is a tax the player can only reduce; the bat is a wager. Skipping a bat costs nothing, and hitting one pays a score premium, so the night's points live on the hardest target and the bat is the shot a player takes when they decide to gamble cheer and streak on it.
- The cheer itself is type-blind: a hit pays the same cheer whatever the target, and a wild shot costs the same whatever it was aimed at. Only the score and the escape differ by type.
- A hit pays back more cheer than a single wild shot costs, so accurate shooting always keeps the crowd longer. A miss never rescues the target it was aimed at: the miss is paid and the escape can happen anyway, so the crowd pays for the shots that land, not for the shots that are taken. Only a run of misses in a row costs more than a hit repays: the crowd spots a flail.
- The first two ghost-or-pumpkin escapes of a night are free. The first cue says this one is free and that later escapes cost cheer.

The crowd's cheer
- The cheer is the one meter besides the score. It starts full and can never rise above full; it drains all the time, and the drain climbs with the night's acts, so every show ends eventually, however clean.
- Misses in a row get dearer exactly once, when act two begins, and the cost has a fixed ceiling from then on; from act two the ladder does not get any steeper. The crowd's growing impatience shows in the drain, not in the price of a miss. Any hit resets the cost to its first step.
- It drops on a shot that hits nothing and on a ghost or pumpkin escape, and every hit pays it back.
- The payback rises only over the first few hits of a streak, then holds flat while the multiplier keeps climbing. So a long streak eases the drain without ever cancelling it.
- When the cheer empties the curtain falls and the round ends. There is no countdown, no lives and no round counter.

The streak
- Every hit extends the streak, and the multiplier for a hit is the streak counting that hit, so the first hit of a night scores once and the multiplier climbs with every clean hit.
- The streak stops climbing at the top of the multiplier, so the longest streak and the best multiplier are the same height and a miss anywhere on the ladder really costs.
- A shot that hits nothing halves the streak, rounded down, and a wild shot at a streak of one clears it. Escapes leave the streak standing.
- No single miss wipes the multiplier, so a hard shot is always a bet the player can afford to make; the streak is worth steadying your aim for, not worth freezing over.

### Rules: prizes and the night

Prize targets
- Now and then a prize target enters the booth: a ghost, a pumpkin or a bat wearing a halo. It is worth more than any other target, including a normal bat.
- A halo steadies its wearer: a prize target always drifts at the ghost's slow pace, whatever its type, so the prize is visible and catchable even for a player who is not landing much. That is why no powerup is hidden behind the hardest target in the booth.
- Shooting a prize target pays a large chunk of the score and starts that type's powerup at once, for a burst of a few seconds.
- Haloes arrive on a fixed grid: one is due at a fixed interval of act time from the start of the night, dealt from a shuffled bag of the three types, so no prize repeats until the other two have had their turn. A halo that comes due while a burst is running enters the booth the moment that burst ends; arriving late never shifts the grid, so no night deals more haloes than the grid allows.
- A prize target that escapes is lost: no powerup starts, its type goes to the back of the bag so the next halo is a different type, and it costs whatever an escape of its type costs — cheer for a ghost or a pumpkin, nothing at all for a bat.
- Ghost's halo, the Spectral Slug: for the whole burst, every shot that lands becomes a chain — it fells its target and leaps to the nearest other target, and on to the next while each is within the ghost's reach; a scattered booth stops the leap.
- Pumpkin's halo, the Candy Buckshot: for the whole burst, every shot is a fan that starts at the gun at the bottom centre of the booth, opens through the crosshair in a wide wedge, and fells every target inside that wedge.
- Bat's halo, Moonstruck: for the whole burst targets move at half speed and the crowd holds its breath, so the drain is zero; the booth keeps spawning on its normal schedule and the act clock never pauses. Misses and escapes still cost, and hits still pay. A half-speed target stays on screen twice as long, so the booth fills with easy targets while the bleed stops. It is a breather for a crowded booth, not a rescue: six seconds of no drain cannot save a show that is already failing, and where in the night it lands is chance.
- The crosshair decides every shot, burst or not. A target under the crosshair is a hit: it pays, it scores the multiplier and it extends the streak. Empty booth under the crosshair is a wild shot: it costs the cheer a wild shot costs and halves the streak, even when a fan or a chain fells targets anyway. Extras still pay.
- Every extra target a chain or a fan fells pays a little cheer and a flat score, and leaves the streak exactly where it was — it neither extends nor breaks it. So a powerup is a surge of points and a way to survive a crowded booth, never a shortcut to the best multiplier: Hot Streak is earned only by aimed shots.
- Aiming a fan between targets therefore buys safety at the price of the streak, which is a real trade during a burst and a bad habit outside one.
- A prize halo glows differently when the shot taken now would count toward Prize Parade, so the player can see whether to grab the burst or steady the streak first.

The night's acts
- The night plays in three acts on the show's own clock, which never pauses except on the Pause screen. Each act opens with a marquee cue and steps up: the booth spawns more and faster targets and the crowd's drain climbs.
- The booth spawns on its own schedule and never waits for the player to clear it, and it keeps a floor of live targets. An escape therefore always means the player let one through, never that the booth starved them at the wrong rate.
- Only the crowd's patience ends the show (the Pause screen excepted). In the last act the drain starts modest and climbs every second with no ceiling, while targets are at their fastest, so the last act is the squeeze: the meter runs while the booth holds its rate.

The results
- The curtain shows the takings, the longest streak, the prizes taken and the stamps earned. The best score is saved.
- Stamps, each one named on the results: Hot Streak — an aimed-shot streak that reaches the top of the multiplier; burst kills never add to it. Prize Parade — all three prizes in one night, each one taken on a live streak: a prize taken cold still pays and still starts its burst, but leaves the parade short, so every halo is a choice between grabbing the burst now and keeping the parade alive. Ghost Train — one Slug burst that fells a whole train of targets, the aimed hits and the chained extras together, so the player steers it by letting the booth fill and firing through the whole burst. Last Act — reaching the third act. These four names are the only stamps; every screen uses them, and each feat's threshold is a tuning constant.
- A prize is taken cold when the shot lands with no streak standing behind it; the results say which prize left its slot empty and how long the best train was, so the player can see what was missing.

### Prototype requirements

Playable browser prototype, mouse and touch (offset crosshair, tap to fire, drag to cancel). All tuning values are editable constants. No rule change is accepted without a logged night that shows the problem.

A play log records, for every night:
- Shots per second and accuracy, split by input: mouse, tap, drag, and cancelled drags.
- The streak profile: how often the streak reached each value, the streak's value at every break, and the longest streak.
- Prizes: for each one, its type, the act and time it appeared, whether it was taken or escaped, and the multiplier of the shot that took it.
- Each powerup burst: its type, the act and time it ran, and the longest chain or the number of extra targets it felled.
- Escapes per minute, share of bats shot, cheer at each act start, cheer lost by drain, wild shot and escape, and the run length.
- For touch runs, how often the raised crosshair was clamped at a booth edge.

Playtest 3 protocol (read the log before changing any number):
- Build: set the values in "Touch tuning values", the 40/30/30 spawn mix and the 25 s halo grid; leave every other tuning value as listed, with all log fields on.
- Touch: 5 first-time touch players on a real phone in portrait, 1–2 nights each. Afterwards ask why they lost and what they thought happened when a Buckshot fan felled targets but halved the streak. Judge the touch values by cancels per night, crosshair clamps at the edges, and the tap/drag split.
- Stamps: 30 nights per accuracy band (44% and 58%) from at least 5 players, at most 6 nights each (mouse is fine). The streak profile settles Hot Streak's cap, fells per Slug burst settle Ghost Train, prize multipliers settle Prize Parade, and bat share among players who hold streaks of 6+ settles the bat premium.
- Night length and escapes: about 5 nights; run length and cheer at each act start settle the act-two drain.
- Fixed-accuracy bot: may estimate Hot Streak odds, night length, escape rate and the cheer curve. It may not judge Prize Parade, Ghost Train, the bat premium or touch feel, because those depend on a player steering or on a hand on glass.

### Playtest results

Playtest 1 (7 mouse runs, old tuning): nights of 15–60 s, nobody reached act three. Accuracy 18–68%, median 44%. Wild shots were the biggest cheer loss, hits paid back less than a miss cost, and weaker players skipped bats.

Playtest 2 (1 mouse run, sixth-pass tuning):
- 58% accuracy at about 1.5 shots a second: the night lasted 112 s and reached act three, with 32 s in the last act. Cheer entering acts two and three was 95 and 64, matching the paper estimate.
- The re-tune works: the night is inside the 90–120 s target, and the median-player maths holds up.
- Wild shots still cost more cheer than escapes, but the drain is now the biggest loss, as intended.
- Escapes are still high at about 17 a minute.
- Half the bats were shot. The host reports bats are small and fast but hittable.
- Three of the four stamps (Hot Streak, Prize Parade, Last Act) were earned in one ordinary night, so stamps will run out too fast.
- No Slug chain reached Ghost Train's length (best was 3).
- Touch is still untested: every shot was a mouse click.
- The build's touch values differ from the Art Director's rules (the cancel strip is on the right only, and the crosshair offset and drag threshold differ).

### Later replay idea

Only if players report boredom: each show features a ghost, pumpkin or bat. Land two consecutive normal shots on that type to earn a featured-act shout-out on the results. This adds no powerup or score rule.

### Touch tuning values (from Art Director)

Confirmed prototype starting values, each an editable constant; untested on touch. Set these before playtest 3.
- Drag threshold: 10 CSS px from touch-down. Once crossed, the touch stays a drag.
- Raised crosshair: 48 CSS px above the finger, clamped to the booth's edges, with no horizontal offset.
- Aiming area below the booth: at least 48 CSS px tall and the booth's width. A touch that starts there begins as a drag.
- Cancel strips: 44 CSS px wide outside each side of the booth, extending alongside the booth and the lower aiming area. Reserve 88 CSS px total: in a 360 CSS px usable viewport, the booth is 272 CSS px wide and the strips fit without covering it. Use the safe usable viewport, not the physical screen width.
- Releasing a drag above the booth, including over the HUD, or below the lower aiming area cancels without firing. Returning to the booth or lower aiming area before release restores aim. This layout fits arithmetically; phone usability remains untested.

### Tuning: cheer, shots, streak, targets

- Cheer: 100, never above 100. Drain per second: act 1 = 0.5, act 2 = 0.7, act 3 = 2.0 rising 0.12 every second with no ceiling. Acts begin at 0 / 40 / 80 s.
- Payback per hit: 2.5 for the first hit of a streak, plus 0.25 for each further step, capped at 3.5 (reached at streak 5). Same for every target type.
- Wild shot cost: flat 1 for all of act one. From act two on: 1, then 2, then 4, capped at 4. Any hit resets it to the first step. The streak halves. Same whatever the shot was aimed at.
- Escape: 2 cheer for a ghost or a pumpkin, 0 for a bat, and the streak is untouched either way. The first two ghost-or-pumpkin escapes of a night are free. A haloed bat that escapes still loses its prize: no burst, and its type goes to the back of the bag.
- What the crosshair decides: target under the crosshair = a hit, at full pay and a streak step. Nothing under the crosshair = a wild shot, at full cost and half the streak, even if a fan or chain fells targets anyway.
- Burst extras: every extra target a chain or fan fells pays 1 cheer and the flat 150 score, and neither extends nor breaks the streak. So a burst adds at most as many streak steps as the player took aimed shots, and Hot Streak stays aimed-only.
- Streak and multiplier: the streak stops at 10, which is also the top multiplier; a hit's multiplier is the streak counting that hit.
- Score per hit: ghost and pumpkin 100 x multiplier; bat 250 x multiplier; prize target 500 x multiplier plus its powerup; every extra target felled by a chain or fan pays a flat 150.
- Hit shape: the painted shape plus a margin of 25% of the target's widest dimension, the same in every act.
- Target speed in booth widths per second: ghost 0.12 drifting, pumpkin 0.18 bouncing, bat 0.30 swooping. Act speed multiplier 1.0 / 1.2 / 1.45. A prize target always moves at 0.12 whatever its type, times the act multiplier.
- Spawns per second: 0.9 / 1.0 / 1.1, with a floor of 2 / 3 / 3 live targets. Act three only reaches 1.1, so the last act is not an unfair flood; its pressure is target speed and the crowd's patience.
- Spawn mix: 40% bats, 30% ghosts, 30% pumpkins, shuffled so no type arrives three times running. The escape figures below assume this mix; changing it moves the night by 10-15 s.

### Tuning: prizes and stamp bars

- Halo grid: one halo is due at each 25 s mark of act time from the start of the night. A halo due while a burst runs enters the moment that burst ends; a late halo never shifts the grid. Types come from a shuffled bag of three, no repeat before the other two. Every burst lasts 6 s.
- Spectral Slug reach: 20% of the booth's width, measured from the last felled target and re-checked against the nearest remaining target on each leap.
- Candy Buckshot: fan from the muzzle at the bottom centre, centred on the crosshair, half-angle 20 degrees, reaching the top of the booth; it fells every target whose centre is inside. Applies to every shot during the burst.
- Moonstruck: for the 6 s burst, targets move at half speed and the passive drain is zero; the booth keeps spawning on its normal schedule and the act clock keeps running. Misses and escapes cost the same as ever.
- Stamp bars: Prize Parade needs each of the three prizes taken at a multiplier of 2 or more (the multiplier is the streak counting that hit, so the prize must not be the first hit of its streak). Ghost Train needs one Slug burst that fells 8 targets, aimed hits plus chained extras. Hot Streak needs a streak of 10, the multiplier cap. Last Act needs act three.
- Log additions: the share of escapes that are bats, the fells per Slug burst, the multiplier of every prize shot, and the streak's value each time a wild shot halves or breaks it.

### Tuning: expected night and pre-registered triggers

Expected night for the median logged player (44% accuracy, about 1.75 shots a second; cheer per second, all four lines). Bat escapes cost no cheer, so the drain and the misses do nearly all the killing:
- Act one (0-40 s): payback +2.3, misses -1.0, ghost-or-pumpkin escapes -0.2, drain -0.5, net about +0.6, so the cheer sits at full. Act one is the tutorial.
- Act two (40-80 s): payback +2.3, misses -2.15, escapes -0.3, drain -0.7, net about -0.85; they enter act three near 66 cheer.
- Act three (80 s on): payback +2.3, misses -2.15, escapes -0.4, drain 2.0 rising 0.12, net about -2.25 at the start; act three lasts about 19-20 s.
- Night length: about 100-105 s, inside the 90-120 s target. A 33% player dies around 75 s, in act two. An 85% player lasts about 150 s, and about 160 s with one Moonstruck in act three, still inside the 3-minute cap. Spam-clicking (3 a second at 18%) dies at about 50 s.
- Haloes per night: a median night gets its 25, 50 and 75 s haloes and usually misses the 100 s one, so three prizes, which the shuffled bag deals as one of each type. An 85% night gets five or six.

Stamp odds for a player who steers:
- Prize Parade: about one night in three for the median player and better than one in two at 58%. The player needs a streak standing when a halo is in the booth, and the halo drifts slowly and shows its Parade cue, so the halo can be held for until a hit lands: nearly every halo the player reaches is shot warm. What is left is the hit itself, roughly 70% on a slow target at 44% accuracy and 85% at 58%, over three haloes. So Parade is an ordinary-night outcome, not a rare one.
- Hot Streak: about one night in ten at 58% and rare at 44%, because the streak must reach 10 with no wild shot in between and a wild shot halves it.
- Ghost Train: needs one Slug burst fired through a booth the player did not clear, which only about one night in three even deals.

Pre-registered triggers, one line each, fired only on the logged evidence named:
- Cheer: if logged nights run past 120 s, act two's drain goes from 0.7 to 0.8 and nothing else changes.
- Bat: the premium stays at 250 until a log shows players who hold streaks of 6 or more skipping bats. It pays score, not cheer, so the median night is the wrong test.
- Ghost Train: the bar goes from 8 to 10 only if the median player fells 8 in a Slug burst on more than one night in four, logged per burst.
- Hot Streak, easier: if 58% runs reach a streak of 10 on fewer than one night in ten, the multiplier cap goes from 10 to 8, which lowers the stamp with it.
- Hot Streak, harder: if 58% runs reach a streak of 10 on more than one night in four, the cap goes from 10 to 12, which raises the stamp with it.
- Prize Parade: if the median player earns Parade on more than one night in three, the Parade bar goes from a multiplier of 2 to 3 and nothing else changes.
- No number changes without QA's night counts: 30 nights per accuracy band from at least 5 players for anything about stamp odds, about 5 nights for night length and escapes, and the touch questions from first-time touch players only.

### Working rule: scoped changes

- Each agent changes only what they were asked to change in that turn.
- A new idea, or a fix outside the request, goes into Open Questions as one line, not into the Rules or Tuning.
- When a change touches a rule, the agent updates every place that rule appears (Rules, Tuning, Brainstorm entries) in the same turn.
- The foreman or the host moves an Open Questions idea into the Rules once it's approved.

## Brainstorm

### Main Game — the booth _(Claude added, not reviewed)_

- [ ] **Mouse clicks fire at the cursor; a touch tap fires at the release point.:** A touch that starts in the booth is a tap until movement passes the drag threshold. After that it is a drag: releasing within the booth or lower aiming area fires at the raised crosshair, and releasing outside cancels. A touch that starts in the area below the booth is a drag from the start. The crosshair is clamped to the booth's edges, and the area below the booth lets it reach the bottom edge. Values are in the touch tuning section.
- [ ] **One shot fells a target, anywhere on its painted shape.:** The hit shape is the target as drawn plus one forgiveness margin, the same in every act. Later acts are harder because targets move and arrive faster, not because the margin shrinks.
- [ ] **A bat is a free skip and a score premium.:** A ghost or pumpkin that escapes costs cheer; a bat that leaves costs nothing, so skipping a bat is never a mistake on its own. A bat also pays a score premium, so the night's points live on the hardest target and the bat is the shot the player chooses to gamble on. Cheer stays type-blind: a hit pays the same whatever the target.
- [ ] **An unhit target that leaves the booth is an escape.:** A ghost or pumpkin escape costs cheer and leaves the streak standing. The cost is small next to a wild shot's, and a miss does not stop the escape, so the escape is a tax the player can only reduce by landing shots. A bat that leaves costs nothing at all: the bat is a wager the player may decline. The booth keeps targets coming and never falls silent. The first two ghost-or-pumpkin escapes of a night are free, and the first cue says this one is free and that later escapes cost cheer.
- [ ] **The crowd's cheer is the round's only meter.:** It starts full and never rises above full. It drains all the time and the drain climbs each act. A shot that hits nothing costs cheer: a flat cost in act one, rising for misses in a row from act two. An escape costs cheer, except a bat's, which costs nothing; every hit pays some back. When it empties the curtain falls; there is no countdown and no lives.
- [x] **The streak is the multiplier.:** Every hit extends it, up to the top of the multiplier, where it stops; its length is the score multiplier for that hit. A shot that hits nothing halves it, rounded down, and clears it at one; escapes leave it standing. The cheer payback stops growing after the first few hits while the multiplier keeps climbing, so a long streak eases the drain but never cancels it.
- [ ] **The night plays in three acts.:** Each act opens with a marquee cue and steps up the spawn rate, target speed and the crowd's drain. The act clock never pauses, not even for a powerup. The booth keeps a floor of live targets, so an escape is always the player's slip. In the last act the drain keeps rising with no ceiling, so every show closes.
- [x] **Prize targets wear a halo, on a fixed grid.:** A haloed ghost, pumpkin or bat is worth a big chunk and starts its type's powerup for a burst long enough to enjoy. A halo steadies its wearer: a prize target always drifts at the ghost's slow pace, so the prize is catchable. Haloes come on a fixed grid of act time from the start of the night, dealt from a shuffled bag of the three types; a halo that comes due while a burst is running enters the moment that burst ends, and arriving late never shifts the grid.
- [x] **Ghost's halo: the Spectral Slug.:** For the whole burst, every hit leaps to the nearest other target, then the next, while the next is within reach; a scattered booth stops the leap.
- [ ] **Pumpkin's halo: the Candy Buckshot.:** For the whole burst, every shot fans out from the gun at the bottom centre through the crosshair and fells every target in the wedge. The crosshair still decides the shot: on a target it is a hit and a streak step; on empty booth it is a wild shot that costs cheer and halves the streak, however many extras the wedge fells.
- [ ] **Bat's halo: Moonstruck.:** For the burst, targets move at half speed and the passive drain is zero; spawns and the act clock run as normal, and misses and escapes still cost. A half-speed target stays twice as long, so the booth fills while the bleed stops: Moonstruck is a breather and a scoring burst for a crowded booth, not a rescue, because six seconds of no drain cannot save a show that is already dying. Whether its halo lands in act three depends on how long the night runs, and the design promises nothing about that.
- [ ] **The booth shows score, streak and crowd cheer without covering the targets.:** The cheer meter reacts to hits, misses and escapes, warns when the show is close to ending, and visibly stops draining during Moonstruck. Act cues do not cover targets. _(Claude added, not reviewed)_
- [ ] **Shots, hits, misses and escapes each have distinct visual and sound feedback.:** Targets react where they are hit. At the booth edge, ghost and pumpkin escapes show their cheer cost; the first free escape says later ones cost cheer. A bat flits away with a distinct “No cheer lost” cue and no loss sound or cheer-meter reaction; an escaping haloed bat also shows “Prize lost.” A miss visibly halves the streak; an escape leaves it standing. If effects get busy, cut floating score and cheer numbers first; keep the action and changing HUD readable. _(Claude added, not reviewed)_
- [ ] **Prize targets show which powerup they grant before being shot.:** The active powerup is named on screen with a clear indication of when it ends. Slug leaps visibly between targets and Buckshot shows its shot area; the aimed hit advances the streak, while extra targets add score and cheer without advancing it. Effects leave targets readable. _(Claude added, not reviewed)_
- [ ] **Marked strips outside both sides of the booth cancel a dragged touch shot.:** The strips run alongside the booth and the lower aiming area, without covering either. Releasing in a strip, above the booth including the HUD, or below the lower aiming area cancels without firing; moving back into the booth or lower aiming area restores the crosshair. Show a cancel cue while outside the aim area. An interrupted touch cancels, and a second finger is ignored while one is down. _(Claude added, not reviewed)_
- [ ] **Pause freezes the show and lets the player resume or quit to Title.:** The game also pauses when its tab loses focus; resuming is manual. Aiming, targets, spawns, cheer, the act clock and powerup durations all stop; an unfinished touch shot is cancelled. _(Claude added, not reviewed)_
- [ ] **The act-two marquee warns that consecutive misses now cost more cheer.:** Each miss shows its actual cheer cost; the increased penalty remains in effect in the final act. _(Claude added, not reviewed)_
- [ ] **During a burst, a shot with an empty crosshair shows its own cue: the targets fall, but the streak visibly halves.:** The powerup's on-screen name carries one line: aim at a target to keep your streak. _(Claude added, not reviewed)_
- [ ] **A halo shows whether a shot now can fill its Prize Parade slot.:** For an unfilled prize type, show “Parade ready” with a lit stamp-shaped badge when a streak is standing, and “Hit first” with an outlined badge when it is not. Update immediately as the streak changes; if the slot is already filled, show “Parade collected” instead. Keep the target and its powerup identity readable, and do not rely on color alone. _(Claude added, not reviewed)_

### Results — the curtain _(Claude added, not reviewed)_

- [x] **The curtain shows the takings, the longest streak, the prizes and the stamps earned.:** The best score is saved, and the stamps are the next thing to chase.
- [ ] **Four stamps name the feats.:** Hot Streak (an aimed-shot streak reaching the top multiplier — burst kills never add to the streak), all three prizes in one night with each taken on a live streak (a cold prize leaves its slot empty and pays nothing toward the stamp), one Slug burst that fells a train of targets (aimed hits plus chained extras), and reaching the last act. _(Claude added, not reviewed)_
- [x] **Play again starts a fresh show; Title returns to the title screen.:** _(Claude added, not reviewed)_
- [ ] **Each stamp can rise from bronze to silver to gold across different shows.:** The current feat earns bronze; repeating that feat on later nights advances its silver and gold progress. Results show progress toward the next tier; thresholds are for playtesting. Tiers add no score or powerup. _(Claude added, not reviewed)_

### Title _(Claude added, not reviewed)_

- [x] **Start opens the haunted shooting gallery.:**
- [x] **The title invites players into a playful Halloween carnival.:**
- [x] **The title shows earned stamps and the feats needed for those still locked.:** _(Claude added, not reviewed)_
- [x] **A short how-to explains shooting, cheer and escapes before the player starts.:** Keep it visible on the title without a separate screen; include tap, drag and cancel for touch. _(Claude added, not reviewed)_

### Pictures

**The booth: ghost, pumpkin and bat prize targets with halos** · Claude · Foreman _(Claude added, not reviewed)_

![The booth: ghost, pumpkin and bat prize targets with halos](<idea-board.assets/a8295f3736f5371a33cc5f6e4949436f.png>)

**Gameplay mock-up — readable targets, cheer and a Slug chain** · GPT-6.1 Terra Pro · Art Director _(Claude added, not reviewed)_

![Gameplay mock-up — readable targets, cheer and a Slug chain](<idea-board.assets/94f26bfa86ce3aa69c09b975bfe05335.jpg>)

**Title mock-up revision — the four game stamp names** · GPT-6.1 Terra Pro · Art Director _(Claude added, not reviewed)_

![Title mock-up revision — the four game stamp names](<idea-board.assets/c86c0b249993b532b81f4f75319b4a78.jpg>)

## Flowchart

### Accepted cards

- **Title**: Start opens the shooting gallery.
- **Main game**: Play until the crowd's cheer runs out.
- **Results**: Review the show and choose what to do next.
- **Pause**: Resume the current show or quit to Title.

### Connections

- Title → Main game (Start)
- Main game → Results (Cheer runs out)
- Results → Main game (Play again)
- Results → Title (Title)
- Main game → Pause (Pause or tab loses focus)
- Pause → Main game (Resume)
- Pause → Title (Quit to Title)

## Ruled out

- **Title screen mock-up — layout exploration; stamp names are placeholders, not the game's feats**: "Replaced by the revised title mock-up; its stamp names (Ghost Hunter, Pumpkin Carver) don't match the game's four stamps." (Claude · Foreman, 2026-10-28, from Title screen mock-up — layout exploration; stamp names are placeholders, not the game's feats)
