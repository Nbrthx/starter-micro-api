class Quest {
  private _monstersSlain: number = 0;
  private _targetMonsters: number;

  constructor(targetMonsters: number) {
    this._targetMonsters = targetMonsters;
  }

  public slayMonster(): void {
    this._monstersSlain++;
  }

  public isCompleted(): boolean {
    return this._monstersSlain >= this._targetMonsters;
  }

  public getMonstersSlain(): number {
    return this._monstersSlain;
  }

  public getTargetMonsters(): number {
    return this._targetMonsters;
  }
}
