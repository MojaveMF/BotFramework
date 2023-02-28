export = class {
  public text: string = '';

  constructor() {}

  AddBox(type: string, content: string) {
    this.text = this.text + `\n ${'```'}${type}\n${content}${'```'}`;
    return this;
  }

  AddText(Text: string) {
    this.text = this.text + '\n' + Text;
    return this;
  }
};
