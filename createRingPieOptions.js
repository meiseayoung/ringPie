function converterRingPie(res, options, component) {
    options.responseData = res;
    res.data && (res.data.length > 100) && (res.data.length = 100);
    var legend = [];
    var categories = [];
    var series = [];
    var yAxis = [];
    var xAsisSetting = options._choiceOptions.filter(function (v, i) {
        return v.s_type === "moduleXAxis"
    });
    var hasXasis = xAsisSetting.length > 0;
    var yAsisSetting = options._choiceOptions.filter(function (v, i) {
        return v.s_type === "moduleYAxis"
    });
    var hasYasis = yAsisSetting.length > 0;
    var legendSetting = options._choiceOptions.filter(function (v, i) {
        return v.s_type === "moduleWeight"
    });
    var hasLegend = legendSetting.length > 0;

    var PIE_WIDTH = options.pieWidth; //柱体宽度
    var MAX_RADIUS = options.ringRadius; //最外层圆弧的外圈半径
    var MIN_RADIUS = options.ringInnerRadius //环心半径
    var PIE_GAP = options.gap || 5; //圆环之间的间隙    
    var MAX_LENGTH = 10; //最大圆环数  
    var ISWISECLOCK = options.ringDirection === "clockwise";

    MAX_LENGTH = Math.floor((MAX_RADIUS - MIN_RADIUS) / (MAX_LENGTH + PIE_GAP)); //动态计算出的最大圆环数

    var dataStyle = {
        normal: {
            label: {
                show: false
            },
            labelLine: {
                show: false
            }
        }
    };


    //不满足的情况:X轴1个维度，图例1个维度, Y轴多度量    
    if (options._choiceOptions.length > 3 && yAsisSetting.length > 1 && xAsisSetting.length > 0 && legendSetting.length) {
        return options;
    }
    //Y轴1个度量，X轴1个维度，图例1个维度
    if (options._choiceOptions.length === 3 && yAsisSetting.length === 1) {
        //图例去重
        //1.获取图例ID
        var legendID = legendSetting[0].id;
        legend = res.data.reduce(function (p, n) {
            if (p.indexOf(n[legendID]) === -1) {
                p.push(n[legendID]);
            }
            return p;
        }, []);
        // if(legend.length > 10){
        //     legend.length = 10;
        // }
        //类目去重
        var yAxisID = xAsisSetting[0].id;
        categories = res.data.reduce(function (p, n) {
            if (p.indexOf(n[yAxisID]) === -1) {
                p.push(n[yAxisID]);
            }
            return p;
        }, []);


        series = categories.map(function (v, i) {
            return {
                name: v || "",
                type: "pie",
                clockWise: ISWISECLOCK, //是否顺时针
                radius: [MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH), MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH) - PIE_WIDTH],
                itemStyle: dataStyle,
                hoverAnimation: false,
                data: _createData(res.data, v, legend)
            }
        });

        function _createData(resData, categoryName, legend) {
            var seriesData4category = resData.filter(function (v, i) {
                return v[xAsisSetting[0].id] === categoryName
            });
            var sum = seriesData4category.map(function (v, i) {
                return v[yAsisSetting[0].id];
            }).reduce(function (p, n) {
                return p + n;
            }, 0);
            return seriesData4category.map(function (v, i) {
                return {
                    value: v[yAsisSetting[0].id],
                    name: legend[i]
                }
            })
        };
        var sereisSum = series.map(function (s, i) {
            return s.data.reduce(function (p, n) {
                return p + n.value
            }, 0)
        });
        var seriesMax = Math.max.apply(null, sereisSum);
        var seriesMin = Math.min.apply(null, sereisSum);

        //----------------------------------------
        // 比例尺转换
        //----------------------------------------
        var scaleLinear = d3v4.scaleLinear()
            .domain([seriesMin, seriesMax])
            .range([0.1, 0.2]);

        series.forEach(function (v, i) {
            var invisibleRandomPercents = (_.random(10, 25) / 100);
            v.data.push({
                value: sereisSum[i] * scaleLinear(seriesMax - sereisSum[i]),
                name: "invisible",
                legendHoverLink: false,
                itemStyle: {
                    normal: {
                        color: "rgba(0,0,0,0)",
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    },
                    emphasis: {
                        color: "rgba(0,0,0,0)"
                    }
                }
            })
        })

        options.series = series;
    }
    //Y轴度量(1-n个),X轴1个维度   ===>Y轴为图例   一个度量时隐藏图例，多个度量时显示图例
    if (yAsisSetting.length > 0 && xAsisSetting.length === 1 && legendSetting.length === 0) {
        legend = yAsisSetting.map(function (v, i) {
            return v.name;
        });
        // if(legend.length > 10){
        //     legend.length = 10;
        // }
        var legendID = yAsisSetting[0].id;
        //类目去重
        var yAxisID = xAsisSetting[0].id;
        categories = res.data.reduce(function (p, n) {
            if (p.indexOf(n[yAxisID]) === -1) {
                p.push(n[yAxisID]);
            }
            return p;
        }, []);

        var sereisSum = res.data.map(function (v, i) {
            return v[yAsisSetting[0].id]
        });

        var seriesMax = Math.max.apply(null, sereisSum);
        var seriesMin = Math.min.apply(null, sereisSum);

        //----------------------------------------
        // 比例尺转换
        //----------------------------------------
        var scaleLinear = d3v4.scaleLinear()
            .domain([seriesMin, seriesMax])
            .range([0.5, 0.1]);

        if (yAsisSetting.length === 1) {
            series = categories.map(function (v, i) {
                var data = res.data.filter(function (d, idx) {
                    return d[xAsisSetting[0].id] === v
                });
                return {
                    name: v || "",
                    type: "pie",
                    clockWise: ISWISECLOCK, //是否顺时针
                    radius: [MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH), MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH) - PIE_WIDTH],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    data: yAsisSetting.map(function (l, idx) {
                        return {
                            value: data[0][yAsisSetting[idx].id],
                            name: legend[idx]
                        }
                    }).concat({
                        value: data[0][yAsisSetting[0].id] * scaleLinear(data[0][yAsisSetting[0].id]),
                        name: "invisible",
                        legendHoverLink: false,
                        itemStyle: {
                            normal: {
                                color: "rgba(0,0,0,0)",
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                            emphasis: {
                                color: "rgba(0,0,0,0)"
                            }
                        }
                    })
                }
            });
        }
        //Y轴多度量
        else {
            var scaleLinear = d3v4.scaleLinear()
                .domain([seriesMin, seriesMax])
                .range([0.1, 0.15]);

            function getSeriesDataByCategory(category) {
                return res.data.filter(function (d, index) {
                    return d[xAsisSetting[0].id] === l
                })[0]
            };
            series = legend.map(function (v, i) {
                return {
                    name: v || "",
                    type: "pie",
                    clockWise: ISWISECLOCK, //是否顺时针
                    radius: [MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH), MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH) - PIE_WIDTH],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    data: categories.map(function (l, idx) {
                        return {
                            value: res.data.filter(function (d, index) {
                                return d[xAsisSetting[0].id] === l
                            })[0][yAsisSetting.filter(function (y) {
                                return y.name === v
                            })[0].id],
                            name: l
                        }
                    })
                }
            });

            var sereisSum = series.map(function (v, i) {
                return v.data.map(function (d, idx) {
                    return d.value;
                }).reduce(function (p, n) {
                    return p + n;
                }, 0);
            });

            var seriesMax = Math.max.apply(null, sereisSum);
            var seriesMin = Math.min.apply(null, sereisSum);

            series.forEach(function (v, i) {
                v.data.push({
                    value: sereisSum[i] * scaleLinear(sereisSum[i]),
                    name: "invisible",
                    legendHoverLink: false,
                    itemStyle: {
                        normal: {
                            color: "rgba(0,0,0,0)",
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            color: "rgba(0,0,0,0)"
                        }
                    }
                })
            })
        }



        options.series = series;
    }
    //Y轴度量(1-n个),图例1个维度  ===>Y轴为图例   一个度量时隐藏图例，多个度量时显示图例
    if (yAsisSetting.length > 0 && xAsisSetting.length === 0 && legendSetting.length === 1) {
        legend = yAsisSetting.map(function (v, i) {
            return v.name;
        });
        // if(legend.length > 10){
        //     legend.length = 10;
        // }
        var legendID = yAsisSetting[0].id;
        //类目去重
        var yAxisID = legendSetting[0].id;
        categories = res.data.reduce(function (p, n) {
            if (p.indexOf(n[yAxisID]) === -1) {
                p.push(n[yAxisID]);
            }
            return p;
        }, []);

        if (yAsisSetting.length === 1) {
            series = categories.map(function (v, i) {
                var data = res.data.filter(function (d, idx) {
                    return d[legendSetting[0].id] === v
                });
                var sereisSum = res.data.map(function (v, i) {
                    return v[yAsisSetting[0].id]
                });

                var seriesMax = Math.max.apply(null, sereisSum);
                var seriesMin = Math.min.apply(null, sereisSum);
                //----------------------------------------
                // 比例尺转换
                //----------------------------------------
                var scaleLinear = d3v4.scaleLinear()
                    .domain([seriesMin, seriesMax])
                    .range([0.5, 0.1]);
                return {
                    name: v || "",
                    type: "pie",
                    clockWise: ISWISECLOCK, //是否顺时针
                    radius: [MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH), MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH) - PIE_WIDTH],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    data: yAsisSetting.map(function (l, idx) {
                        return {
                            value: data[0][yAsisSetting[idx].id],
                            name: legend[idx]
                        }
                    }).concat({
                        value: data[0][yAsisSetting[0].id] * scaleLinear(data[0][yAsisSetting[0].id]),
                        name: "invisible",
                        legendHoverLink: false,
                        itemStyle: {
                            normal: {
                                color: "rgba(0,0,0,0)",
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                            emphasis: {
                                color: "rgba(0,0,0,0)"
                            }
                        }
                    })
                }
            });
        }
        //Y轴多度量
        else {
            series = legend.map(function (v, i) {
                return {
                    name: v || "",
                    type: "pie",
                    clockWise: ISWISECLOCK, //是否顺时针
                    radius: [MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH), MAX_RADIUS - i * (PIE_GAP + PIE_WIDTH) - PIE_WIDTH],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    data: categories.map(function (l, idx) {
                        return {
                            value: res.data.filter(function (d, index) {
                                return d[legendSetting[0].id] === l
                            })[0][yAsisSetting.filter(function (y) {
                                return y.name === v
                            })[0].id],
                            name: l
                        }
                    })
                }
            });

            var sereisSum = series.map(function (v, i) {
                return v.data.map(function (d, idx) {
                    return d.value;
                }).reduce(function (p, n) {
                    return p + n;
                }, 0);
            });

            var seriesMax = Math.max.apply(null, sereisSum);
            var seriesMin = Math.min.apply(null, sereisSum);

            var scaleLinear = d3v4.scaleLinear()
                .domain([seriesMin, seriesMax])
                .range([0.1, 0.15]);

            series.forEach(function (v, i) {
                v.data.push({
                    value: sereisSum[i] * scaleLinear(sereisSum[i]),
                    name: "invisible",
                    legendHoverLink: false,
                    itemStyle: {
                        normal: {
                            color: "rgba(0,0,0,0)",
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            color: "rgba(0,0,0,0)"
                        }
                    }
                })
            });

            function _createData(resData, categoryName, legend) {
                var seriesData4category = resData.filter(function (v, i) {
                    return v[legendSetting[0].id] === categoryName
                });
                var sum = seriesData4category.map(function (v, i) {
                    return v[yAsisSetting[0].id];
                }).reduce(function (p, n) {
                    return p + n;
                }, 0);
                return legend.map(function (v, i) {
                    return {
                        value: seriesData4category[0][yAsisSetting.filter(function (val, idx) {
                            return val.name === v;
                        })[0].id],
                        name: v || ""
                    }
                })
            };

        }


        options.series = series;

    };

    return options;
};
