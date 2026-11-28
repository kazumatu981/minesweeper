import { MineField } from './components/mine-field.js';
import { Scoreboard } from './components/scoreboard.js';
import { ScoreManager } from './components/score-manager.js';

export class App {
    private readonly _element: HTMLDivElement;
    readonly #messageElement: HTMLElement;
    readonly #mineField: MineField;
    readonly #scoreManager: ScoreManager = new ScoreManager();
    readonly #scoreBoard: Scoreboard;

    public constructor() {
        this.#mineField = new MineField(
            {
                size: 10,
                bombCount: 20,
            },
            this.#scoreManager
        );
        this.#scoreBoard = new Scoreboard(this.#scoreManager);
        this.#messageElement = document.createElement('div');

        this._element = this.#buildAppPanel();
    }

    #buildAppPanel(): HTMLDivElement {
        const rootElement = document.getElementById('app') as HTMLDivElement;

        rootElement.append(this.#buildLeftPanel(), this.#buildRightPanel());

        return rootElement;
    }
    #buildLeftPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.id = '__app_left';

        panel.appendChild(this.#mineField.element);

        return panel;
    }

    #buildRightPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.id = '__app_right';

        panel.appendChild(this.#scoreBoard.element);
        panel.appendChild(this.#messageElement);

        return panel;
    }
}
