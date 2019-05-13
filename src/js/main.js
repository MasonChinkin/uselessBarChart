import * as d3 from 'd3';
import {
  barDataset
} from './data'

export default function () {
  const w = container.offsetWidth
  const h = container.offsetHeight

  const margin = {
    right: 50,
    left: 50,
    top: 20,
    bottom: 20
  }

  //properties of mouseout
  const barMouseOut = function (d) {
    d3.select(this)
      .transition('orangeHover')
      .duration(250)
      .attr('fill', d => {
        //find cy of slider
        const handleCy = document.getElementById('handle').getAttribute('cy')

        return (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) ?
          'orange' :
          'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
      })

    //Hide the tooltip
    d3.select('#tooltip').classed('hidden', true)
  }

  //properties of mousemove
  const barMouseMove = function (d) {
    d3.select(this)
      .attr('fill', 'orange')

    const xpos = event.pageX
    const ypos = event.pageY + 10

    //Update the tooltip position and value
    d3.select('#tooltip')
      .style('left', xpos + 'px')
      .style('top', ypos + 'px')
      .select('#value')
      .text(d.value)

    //Show the tooltip
    d3.select('#tooltip').classed('hidden', false)
  }

  const key = d => d.key

  //SCALES
  const x = d3.scaleBand()
    .domain(d3.range(barDataset.length))
    .rangeRound([0, w - margin.right])
    .paddingInner(0.05)

  const y = d3.scaleLinear()
    .domain([0, d3.max(barDataset, d => d.value)])
    .range([margin.top, h - margin.bottom])
    .clamp(true)

  const svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)

  //BARS
  const bars = svg.selectAll('rect')
    .data(barDataset, key)

  bars.enter()
    .append('rect')
    .attr('x', (d, i) => x(i))
    .attr('y', d => h - y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => y(d.value))
    .attr('fill', d => 'rgb(0,0, ' + Math.floor(y(d.value)) + ')')
    .on('mousemove', barMouseMove)
    .on('mouseout', barMouseOut)

  //LABELS
  const text = svg.selectAll('text')
    .data(barDataset, key)

  text.enter()
    .append('text')
    .text(d => d.value)
    .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
    .attr('y', d => (d.value >= 6) ? h - y(d.value) + 14 : h - y(d.value) - 4)
    .attr('class', 'barLabel')
    .attr('fill', d => (d.value >= 6) ? 'white' : 'black')

  //SLIDER
  const slider = svg.append('g')
    .attr('class', 'slider')
    .attr('transform', `translate(${(w - (margin.right / 2))},${margin.top})`)

  slider.append('line')
    .attr('class', 'track')
    .attr('y1', y.range()[0])
    .attr('y2', y.range()[1])
    .select(function () {
      return this.parentNode.appendChild(this.cloneNode(true))
    })
    .attr('class', 'track-overlay')
    .call(d3.drag()
      .on('drag', function () {
        slide(y.invert(d3.event.y))

        d3.selectAll('rect')
          .attr('fill', d => {
            if (d3.max(barDataset, d => d.value) - y.invert(d3.event.y) >= d.value) {
              return 'orange'
            } else {
              return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
            }
          })
          .on('mousemove', barMouseMove)
          .on('mouseout', barMouseOut)
      }))

  const handle = slider.insert('circle', '.track-overlay')
    .attr('class', 'handle')
    .attr('id', 'handle')
    .attr('r', 9)
    .attr('cy', 275)

  //find cy of slider
  const handleCy = document.getElementById('handle').getAttribute('cy')

  function slide(h) {
    handle.attr('cy', y(h))
  }

  d3.select('#add')
    .on('click', () => {

      const maxValue = 40 //max value for any randomiz data

      const newNumber = Math.floor(Math.random() * maxValue)
      const lastKeyNumber = d3.max(barDataset, d => d.key)
      barDataset.push({
        key: lastKeyNumber + 1,
        value: newNumber, //Add new number to array
      })

      //UPDATE SCALES
      x.domain(d3.range(barDataset.length))
      y.domain([0, d3.max(barDataset, d => d.value)])

      const bars = svg.selectAll('rect') //SELECT
        .data(barDataset)

      //Transition BARS
      bars.enter() //ENTER
        .append('rect')
        .attr('x', w)
        .attr('y', d => h - y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.value))
        .attr('fill', function (d) {
          const handleCy = document.getElementById('handle').getAttribute('cy')

          return (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) ?
            'orange' : 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
        })
        .on('mousemove', barMouseMove)
        .on('mouseout', barMouseOut)
        .merge(bars)
        .transition('barsAddBar')
        .duration(250)
        .attr('x', (d, i) => x(i))
        .attr('y', d => h - y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.value))
        .attr('fill', function (d) {
          //find cy of slider
          const handleCy = document.getElementById('handle').getAttribute('cy')

          return (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) ?
            'orange' : 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
        })

      //TRANSITION LABELS
      const text = svg.selectAll('text')
        .data(barDataset)

      text.enter()
        .append('text')
        .text(d => d.value)
        .attr('x', w + (x.bandwidth() / 2))
        .attr('y', d => (d.value >= 6) ? h - y(d.value) + 14 : h - y(d.value) - 4)
        .attr('class', 'barLabel')
        .attr('fill', d => (d.value >= 6) ? 'white' : 'black')
        .merge(text)
        .transition('textAddBar')
        .duration(250)
        .text(d => d.value)
        .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
        .attr('y', d => (d.value >= 6) ? h - y(d.value) + 14 : h - y(d.value) - 4)
    })

  d3.select('#subtract')
    .on('click', function () {
      barDataset.shift()

      const bars = svg.selectAll('rect') //SELECT
        .data(barDataset, key)

      bars.exit() //EXIT
        .transition('exitBars')
        .duration(250)
        .attr('x', -x.bandwidth()) //EXIT STAGE LEFT
        .remove()

      const text = svg.selectAll('text')
        .data(barDataset, key)

      text.exit() //EXIT
        .transition()
        .duration(250)
        .attr('x', -x.bandwidth() / 2) //EXIT STAGE LEFT
        .remove()

      //UPDATE SCALES
      x.domain(d3.range(barDataset.length))
      y.domain([0, d3.max(barDataset, d => d.value)])

      bars.transition('barsRemoveBar')
        .duration(250)
        .attr('x', (d, i) => x(i))
        .attr('y', d => h - y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.value))
        .attr('fill', d => {

          //find cy of slider
          const handleCy = document.getElementById('handle').getAttribute('cy')

          return (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) ?
            'orange' : 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
        })

      text.transition('textRemoveBar')
        .duration(250)
        .text(d => d.value)
        .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
        .attr('y', d => (d.value >= 6) ? h - y(d.value) + 14 : h - y(d.value) - 4)
    })

  //SLIDER
  d3.select('#barSlider')
    .on('mousemove', function () {

      const threshold = +d3.select(this).node().value
    })

  //Slider label
  function outputUpdate(vol) {
    document.querySelector('#volume').value = vol
  }

  d3.select('#sort')
    .on('click', function () {
      svg.selectAll('rect')
        .sort((a, b) => d3.ascending(a.value, b.value))
        .transition('sortBars')
        .duration(250)
        .attr('x', (d, i) => x(i))

      svg.selectAll('text')
        .sort((a, b) => d3.ascending(a.value, b.value))
        .transition('sortText')
        .duration(250)
        .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
      barDataset.sort((a, b) => a.value - b.value)
    })
}