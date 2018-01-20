const colors = ['#4BC0C0', '#FFA6B8', '#36A2EB', '#FFCE56', '#979D91', '#A71D1D', '#714096', '#8CCB2A', '#ED8618', '#6B720C']
const colorsEachNode: { [name: string]: string } = {}
export function getColor (nodeName: string) {
  const color = colorsEachNode[nodeName]
  if (color) {
    return color
  }
  const index = Object.keys(colorsEachNode).length % colors.length
  colorsEachNode[nodeName] = colors[index]
  return colors[index]
}
