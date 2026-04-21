/*与教程不同，我将采用React而非Preact */

import { useState } from "react";

type GreetingProps = {
	messages: string[];
};

export default function Greeting({ messages }: GreetingProps) {
	const getRandomMessage = (): string =>
		messages[Math.floor(Math.random() * messages.length)] ?? "";

	const getNextMessage = (current?: string): string => {
		if (messages.length <= 1) {
			return current ?? "";
		}

		let next = current;
		while (next === current) {
			next = getRandomMessage();
		}
		return next ?? "";
	};

	const [greeting, setGreeting] = useState<string>(getNextMessage());

	return (
		<div>
			<h3>{greeting}!</h3>
			<button onClick={() => setGreeting(getNextMessage(greeting))}>
				换一句
			</button>
		</div>
	);
}