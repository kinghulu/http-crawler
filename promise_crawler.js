var http = require('http');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var baseUrl = 'http://www.imooc.com/learn/';
var videoIds = [75,134,197,259];

function filterChapters(html){
	var $ = cheerio.load(html);
	$('.chapter-content').remove();
	$('.moco-btn').remove();
	var title = $('.path a span').text().trim();
    var chapters = $('.chapter');
    var courseData = {
    	title:title,
    	videos:[]
    };

	chapters.each(function(item){
		var chapter = $(this);
        var chapterTitle = chapter.find('strong').text().trim();
        var videos = chapter.find('.video').children('li')

        var chapterData = {
        	chapterTitle:chapterTitle,
        	videos:[]
        }

       videos.each(function(item){
       	  var video = $(this);
       	  var videoTitle = video.find('.J-media-item').text().replace(/\s+/g,' ');
       	  var id = video.find('.J-media-item').attr('href').split('video/')[1];	

       	  chapterData.videos.push({
       	  		title:videoTitle,
       	  		id:id
       	  })

       }) 
		courseData.videos.push(chapterData);		
	})
	return courseData;
}



//打印采集到的数据
function printCourseInfo (coursesData) { 

	coursesData.forEach(function(courseData){ 
		console.log('#####'+courseData.title+'\n') 
	}) 

	coursesData.forEach(function(courseData){ 
			console.log('### '+courseData.title+'\n') 
			courseData.videos.forEach(function(item){ 
				var chapterTitle=item.chapterTitle 

				console.log(chapterTitle+'\n') 
				item.videos.forEach(function(video){ 
					console.log(' ['+video.id+'] '+video.title+'\n') 
				}) 
			}) 
		}) 
	}


//获取页面html源码
function getPageAsync(url){
	return new Promise(function(resolve,reject){
		console.log('正在爬取'+url);
		http.get(url,function(res){
			var html = '';
			res.on('data',function(data){
				html += data;
			})
			res.on('end',function(){
				resolve(html);
			})
		}).on('error',function(e){
			reject(e);
			console.log('获取课程数据出错！');
		})
	})
}

var fetchCourseArray = [];

//遍历videoIds，得到每个页面的id，得出html，添加到fetchCourArray中
videoIds.forEach(function(id){
	fetchCourseArray.push(getPageAsync(baseUrl+id));
})


//遍历每个page的html，并执行filterChapter函数，得出courseDate数组
Promise
	.all(fetchCourseArray)
	.then(function(pages){
		var coursesData = [];
		pages.forEach(function(html){
			var courses = filterChapters(html);
			coursesData.push(courses);
		})

		coursesData.sort(function(a,b){
			return a.number < b.number;
		})

		printCourseInfo(coursesData);

	})

  







