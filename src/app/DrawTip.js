export class DrawTip {
    constructor(type, width, color, tipChangeCallback) {
        this.type = type || null;
        this.width = width || 1;
        this.color = color || "#000000";
        this.tipChangeCallback = tipChangeCallback || function(tip) { return; };
    }

    activate() {
        tipChange(this);
    }
}
