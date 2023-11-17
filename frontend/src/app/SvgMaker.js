import { Browser } from "./Browser.js";

function SvgFactory(strokes) {
    let svg = [];
    let header = "xmlns='http://www.w3.org/2000/svg'"
    let width = Browser.width
    let height = Browser.height

    svg.push(`<svg ${header} width="${width}" height="${height}">`);

    strokes
        .filter(x => x.action==='stroke')
        .map(x => x.stroke)
        .forEach(stroke => {
            let pairs = stroke._path.reduce((a, c) => {
                a.push(`${c._x} ${c._y}`);
                return a;
            }, []).join(', ')

            svg.push(`<polyline fill="none" stroke="${stroke.tip.color}"
                stroke-width="${stroke.tip.width}" points="${pairs}">
                </polyline>`);
        })
    svg.push("</svg>");
    svg = svg.join('');

    return `data:image/svg+xml,${svg}`;
}

class SvgMaker {
}

export {
    SvgFactory,
    SvgMaker,
}
