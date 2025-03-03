document.addEventListener('DOMContentLoaded', function () {
            const margin = { top: 50, right: 30, bottom: 50, left: 70 },
                width = 800 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#line_chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            const chartArea = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const tooltip = d3.select(".tooltip");

            const x = d3.scaleLinear().range([0, width]);
            const y = d3.scaleLinear().range([height, 0]);
            const color = d3.scaleOrdinal().range(d3.schemeTableau10);

            const xAxis = chartArea.append("g")
                .attr("transform", `translate(0, ${height})`);

            const yAxis = chartArea.append("g");

           
            svg.append("text")
                .attr("transform", `rotate(-90)`)
                .attr("x", -(height / 2))
                .attr("y", 10)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Consumption in Exajoules");

            const line = d3.line()
                .x(d => x(d.Year))
                .y(d => y(d.Value));

            const continentDescriptions = {
                "Africa": "Africa's energy consumption is increasing slowly as more parts gain access to electricity and modern energy sources.",
                "Asia": "Asia's trend is mostly upwards due to increased population, industrialization, and urbanization, as well as a limited scope of energy-efficient practices.",
                "Europe": "Europe shows a stable or slightly declining trend due to more energy efficiency policies and renewable energy initiatives.",
                "North America": "North America's energy consumption remains stable, which is due to balance between industrial activity and energy efficiency improvements.",
                "South America": "South America's energy consumption is growing slightly due to urbanization and expanding access to energy in rural areas.",
                "Independent": "This region shows unique shows no trends due tothe fact that there varying polcies and trends.",
                "Middle East": "The Middle East has a rising trend due to economic growth and more reliance on energy in industries."
            };

            let data = [];
            let selectedContinents = [];

            d3.csv("./data/energyconsum.csv").then(loadedData => {
                data = loadedData.map(d => ({
                    Year: +d.Year,
                    Value: +d.Value,
                    Continent: d.Continent
                }));

                const continents = [...new Set(data.map(d => d.Continent))];
                color.domain(continents);

                x.domain(d3.extent(data, d => d.Year));
                y.domain([0, d3.max(data, d => d.Value)]);

                xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
                yAxis.call(d3.axisLeft(y));

                update(selectedContinents);
            });

            function update(selectedContinents) {
                const filteredData = data.filter(d => selectedContinents.includes(d.Continent));
                const nestedData = d3.group(filteredData, d => d.Continent);

                chartArea.selectAll(".line").remove();

                chartArea.selectAll(".line")
                    .data(nestedData)
                    .join("path")
                    .attr("class", "line")
                    .attr("fill", "none")
                    .attr("stroke", d => color(d[0]))
                    .attr("stroke-width", 5)
                    .attr("d", d => line(d[1]))
                    .on("mouseover", (event, d) => showTooltip(event, d))
                    .on("mousemove", moveTooltip)
                    .on("mouseout", hideTooltip);
            }

            function showTooltip(event, d) {
                const continent = d[0];
                const description = continentDescriptions[continent];

                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${continent}</strong><br>
                        ${description}
                    `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            }

            function moveTooltip(event) {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            }

            function hideTooltip() {
                tooltip.style("opacity", 0);
            }

            d3.selectAll("#viz4 input").on("change", function () {
                selectedContinents = Array.from(
                    document.querySelectorAll("#viz4 input:checked")
                ).map(d => d.value);

                update(selectedContinents);
            });
        });
