	var CircleLabels = Class.extend({
		/**
		 * [初始化组件配置项]
		 * @param  {[type]} opts [配置项]
		 * @return {[undefined]}      [无返回值]
		 */
		init:function(opts){
			var DEFAULT = {
				componentID:null,
				componentSeries:[]
			}
			this.config = Object.assign(DEFAULT,opts);
			this.createStartLabelsDOM();
			this.createEndLabelsDOM();
		},
		/**
		 * [图表系列数据转换成组件内部可用的数据]
		 * @param  {[Array]} chartSeries [图表系列数据]
		 * @return {[Array]}             [组件内部可用的数据]
		 */
		converterSeries:function(chartSeries){
			return chartSeries.map(function(v,i){
				return {
					data:v.data.map(function(val,idx){
						return val.value
					}),
					radius:v.radius,
					seriesName:v.name
				}
			})
			.filter(function(v,i){   //过滤掉负值的圆弧
				return v.radius[0] > 0 &&  v.radius[1] > 0;
			});
		},
		/**
		 * [生成结束标签至图表组件]
		 * @return {[undefined]} [无返回值]
		 */
		createEndLabelsDOM:function(){
			var me = this;
			$( "#" + me.config.componentID +  " .endLableContainer" ).remove();
			if(this.config.componentSeries[0].data.length > 2){
				return;
			}
			var chartSeries = $("#"+ me.config.componentID).widget().chartOptions.series;
			var ringDirectionIsClockwise = ($("#"+ me.config.componentID).widget().chartOptions.ringDirection === "clockwise");
			var colors = $("#"+ me.config.componentID).widget().chartOptions.color;
			var series = me.converterSeries(chartSeries);
			var width = $("#" + me.config.componentID).width();
			var height = $("#" + me.config.componentID).height();
			var lableHTML = '<div class="endLableContainer" style="position:absolute;width:'+ width +'px;height:'+height+'px">';
			series.forEach(function(v,i){
				lableHTML += '<div class="circleLabel" style="transform: translate(0,0);position:absolute;left:50%;top:50%;">\
					<span style="display:inline-block;">'+series[i].data[0]+'</span>\
				</div>';
			});
			lableHTML += '</div>';
			$("#"+ me.config.componentID + ">div:nth-child(1)").append($(lableHTML));
			var labels = document.querySelectorAll( "#" + me.config.componentID + " .endLableContainer>.circleLabel");
			var labels2Array = [].slice.apply(labels);
			labels2Array.forEach(function(label,index){
				var data = series[index].data;
				var r = series[index].radius[0];
				var radians =( data[0]/(data[0]+data[1]) * 2 * Math.PI );
				var x = r * Math.sin(radians);
				var y = r * Math.cos(radians);
				console.log(x,y);
				if(ringDirectionIsClockwise){
					label.style.transform = "translate("+(x)+"px,"+(-y)+"px)";
				}else{
					label.style.transform = "translate("+(-x)+"px,"+(-y)+"px)";
				}
				label.style.color = colors[index];
			});
			labels2Array.forEach(function(label,index){
				var labelHeight = $(label).height();
				$(label).css({
					marginTop:-labelHeight
				})
			});
		},
		/**
		 * [生成开始标签至图表组件]
		 * @return {[undefined]} [无返回值]
		 */
		createStartLabelsDOM:function(){
			var me = this;
			$( "#" + me.config.componentID +  " .startLableContainer" ).remove();
			var chartSeries = $("#"+ me.config.componentID).widget().chartOptions.series;
			var ringDirectionIsClockwise = ($("#"+ me.config.componentID).widget().chartOptions.ringDirection === "clockwise");
			var colors = $("#"+ me.config.componentID).widget().chartOptions.color;
			var series = me.converterSeries(chartSeries);
			var width = $("#" + me.config.componentID).width();
			var height = $("#" + me.config.componentID).height();
			var lableHTML = '<div class="startLableContainer" style="position:absolute;width:'+ width +'px;height:'+height+'px">';
			series.forEach(function(v,i){
				lableHTML += '<div class="circleLabel" style="transform: translate(0,0);position:absolute;left:50%;top:50%;">\
					<span style="display:inline-block;margin-left:10px;">'+series[i].seriesName+'</span>\
				</div>';
			});
			lableHTML += '</div>';
			$("#"+ me.config.componentID + ">div:nth-child(1)").append($(lableHTML));
			var labels = document.querySelectorAll( "#" + me.config.componentID + " .startLableContainer>.circleLabel");
			[].slice.apply(labels).forEach(function(label,index){
				var data = series[index].data;
				var r = series[index].radius[0];
				var radians =( data[0]/(data[0]+data[1]) * 2 * Math.PI );
				var x = r * Math.sin(radians/360);
				var y = r * Math.cos(radians/360);
				console.log(x,y);
				if(ringDirectionIsClockwise){
					var labelWidth = $(label).width();
					label.style.transform = "translate("+(-x-labelWidth)+"px,"+(-y)+"px)";
				}else{
					label.style.transform = "translate("+(-x)+"px,"+(-y)+"px)";
				}
				label.style.color = colors[index];
			});
		}
	});
