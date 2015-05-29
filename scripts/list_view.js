var add_list_narrow_state={
	opened:false
}

var content_narrow_state={
	opened:true
}

document.addEventListener('polymer-ready', function() {
	var list = $(".list_button");
	var title = $("#list_button").find('#title').text();
	$(".list_card").click(function() {
	document.location.href = "/list?list_title="+$(this).find('#title').text()
	})

	/*$(".list_item").click(function(){
		alert("hi")
	})*/

	$("paper-dropdown-menu").each(function(){
		this.addEventListener('core-select', function(e){
			list_type = $(e.detail.item).parent().parent().parent().parent().find('.list_type')
			list_type.val($(e.detail.item).find('.type_item').html())
		})
	})

	$("#drawerPanel").get(0).addEventListener('core-responsive-change', function(e){
		if(!e.detail.narrow && $('.add_list_narrow').hasClass('core-opened')){
			$("#add_list_dialog").find('.list_title').val($('.add_list_narrow').find('.list_title').val())
			$("#add_list_dialog").find('.list_type').val($('.add_list_narrow').find('.list_type').val())
			//$("#add_list_dialog").find('paper-dropdown-menu').html($('.add_list_narrow').find('paper-dropdown-menu').html())
			$("#add_list_dialog").find('paper-dropdown-menu').find('paper-dropdown').find('core-menu').find('paper-item').each(function(){
				if($(this).find('.type_item').html() == $('.add_list_narrow').find('.list_type').val()){
					$(this).addClass("core-selected")
					$(this).attr("active", "")
				}
			})
			
			if($('.add_list_narrow').find('.list_type').val() != ""){
				$("#add_list_dialog").get(0).querySelector('paper-dropdown-menu::shadow #label').className = "selectedItem"
				$($("#add_list_dialog").get(0).querySelector('paper-dropdown-menu::shadow #label')).html($('.add_list_narrow').find('.list_type').val())
			}
			//$("#add_list_narrow").get(0).addAttribute('hidden')
			toggleHomeAdd()
			document.getElementById('add_list_dialog').toggle()
		}
		else if(e.detail.narrow && $('core-overlay-layer').hasClass('core-opened')){
			$('.add_list_narrow').find('.list_title').val($($('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog')).find('.list_title').val())
			$('.add_list_narrow').find('.list_type').val($($('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog')).find('.list_type').val())
			//$("#add_list_dialog").find('paper-dropdown-menu').html($('.add_list_narrow').find('paper-dropdown-menu').html())
			$('.add_list_narrow').find('paper-dropdown-menu').find('paper-dropdown').find('core-menu').find('paper-item').each(function(){
				if($(this).find('.type_item').html() == $($('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog')).find('.list_type').val()){
					$(this).addClass("core-selected")
					$(this).attr("active", "")
				}
			})
			if($($('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog')).find('.list_type').val() != ""){
				$('.add_list_narrow').get(0).querySelector('paper-dropdown-menu::shadow #label').className = "selectedItem"
				$($('.add_list_narrow').get(0).querySelector('paper-dropdown-menu::shadow #label')).html($($('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog')).find('.list_type').val())
			}
			//$("#add_list_narrow").get(0).addAttribute('hidden')
			toggleHomeAdd()
			$('core-overlay-layer').get(0).querySelector('overlay-host::shadow #add_list_dialog').toggle()
		}
	})

	/*var tabs = document.querySelector('paper-tabs');
	$(".list_container").each(function(){
			if(!$(this).hasClass(tabs.selected)){
				$(this).hide()
			}
		})
	$( "."+tabs.selected ).show();

	tabs.addEventListener('core-select', function() {
		$(".list_container").each(function(){
			if(!$(this).hasClass(tabs.selected)){
				$(this).hide()
			}
		})
		$( "."+tabs.selected ).show();


	});*/

	transitionSetup()
	var meta = document.createElement('core-meta');
    meta.type = 'transition';
    var transitionFade = meta.byId('core-transition-fade');
    $('#drawerPanel').css('display', '')
    setTimeout(function(){transitionFade.go($('#drawerPanel').get(0), {opened:true});}, 000)

	container_size = Math.floor($(".content").width() / 170)
	if($(".list_container").children().length < container_size)
		container_size = $(".list_container").children().length
	$(".list_container").width(container_size * 170)
	$(".add_list_narrow").css("left", ($("core-scroll-header-panel").width()*0.05)+"px")
	$(window).resize(function() {
		//alert(Math.floor($(".content").width() / 170))
		if($('.main_pages').get(0).selected == 0){
		    container_size = Math.floor($(".content").width() / 170)
		    if($(".list_container").children().length < container_size)
				container_size = $(".list_container").children().length
		    $(".list_container").width(container_size * 170)
		}
		else
	    	$(".add_list_narrow").css("left", ($("core-scroll-header-panel").width()*0.05)+"px")

	});

	
	$("#add_list_narrow").get(0).removeAttribute('hidden')

	$(".back_button").click(function(){
		if($('.main_pages').get(0).selected != 0)
			$('.main_pages').get(0).selected = 0
	})

	$(".add_list").click(function(){
		if(!($("#drawerPanel").attr("narrow") == ""))
			document.getElementById('add_item_dialog').toggle()
		else{
			if($('.main_pages').get(0).selected != 2)
				$('.main_pages').get(0).selected = 2
			else
				$('.main_pages').get(0).selected = 0
			//toggleHomeAdd()
		}
	})

	$('.put_list').click(function(){
		if($(this).parent().find('paper-input-decorator').find('.list_title').val() == "")
			$(this).parent().find('paper-input-decorator').get(0).isInvalid = true
		else
			addList(this)
	})
});

function toggleHomeAdd(){
	var meta = document.createElement('core-meta');
    meta.type = 'transition';
    var transition = meta.byId('core-transition-left');
    var transition2 = meta.byId('core-transition-right');

    // Run the animation
    var animated = document.getElementById('add_list_narrow');
    add_list_narrow_state.opened = !add_list_narrow_state.opened
    content_narrow_state.opened = !content_narrow_state.opened
    if(content_narrow_state.opened){
    	$('.add_list').attr("icon", "add")
    	$(".content").css("display", "block")
    	//$(".content").get(0).removeAttribute('hidden')
    }

    setTimeout(function(){transition2.go($('.content').get(0), content_narrow_state);}, 000)

    if(!content_narrow_state.opened){
    	$('.add_list').attr("icon", "arrow-back")
    	setTimeout(function(){$(".content").css("display", "none")}, 100)
    }
    
    transition.go(animated, add_list_narrow_state);
}

function transitionSetup(){
	var meta = document.createElement('core-meta');
    meta.type = 'transition';
    var transition = meta.byId('core-transition-left');
    var transition2 = meta.byId('core-transition-right');
    var transitionFade = meta.byId('core-transition-fade');


    // Run the animation
    var animated = document.getElementById('add_list_narrow');
    //transition.setup(animated, add_list_narrow_state);
    //transition2.setup($('.content').get(0), content_narrow_state)
    //transition2.go($('.content').get(0), content_narrow_state);
    transitionFade.setup($('.search_item_dialog').get(0), {opened: true})
    transitionFade.go($('.search_item_dialog').get(0), {opened: true})
    transitionFade.setup($('#drawerPanel').get(0), {opened: true})
    transitionFade.setup($('.results').get(0), {opened: false})
    transitionFade.go($('.results').get(0), {opened: false})
}

function addList(t){
    $.ajax({
      type: "POST",
      url: "/addList",
      data: { ListTitle: $(t).parent().find(".list_title").val(),
              ListType: $(t).parent().find(".list_type").val().toLowerCase(),
            },
      success: function(html){
        //$( "#add" ).html( html );
        alert(html)
        if(html == "added"){
        	location.reload();
        }
        else
        	alert("poop")
        //$('#overlay').css('visibility', 'visible')
      }
    })
}

function findItem( t, listType ){
	$(t).parent().siblings('.loading_container').find('paper-spinner').attr('active', '')
  find_url = '/find'
    if (listType == 'games'){
      find_url += "Game"
    }
    else if (listType == 'books'){
      find_url += "Book"
    }
    else{
      find_url += "Movie"
    }
    $.ajax({
      type: "POST",
      url: find_url,
      data: { Title: $(t).parent().find(".search_title").val(),
              list_type: listType,
            },
      success: function(html){
      	//alert($(t).parent().attr("class"));
      	$(t).parent().siblings('.loading_container').find('paper-spinner').attr('active', 'false')
      	//$(t).parent().css("display", "block")
      	$(t).parent().parent().find( ".results" ).attr('flex', '');
      	var meta = document.createElement('core-meta');
    	meta.type = 'transition';
    	var transitionFade = meta.byId('core-transition-fade');
    	$(t).parent().parent().find( ".results" ).html( html );
    	setTimeout(function(){transitionFade.go($(t).parent().parent().find( ".results" ).get(0), {opened: true})}, 300)
        
        //$('#overlay').css('visibility', 'visible')
      }
    })
}

function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (o.scrollHeight)+"px";
}

function getItemDetails(e, listType){
	//alert('poop')
	//$(e).parent().css('display', 'none')
	//$(e).parent().siblings('.loading_container').find('paper-spinner').attr('active', 'true')
	//$('.addNew').css('display', 'block')
	//$(e).parent().siblings(".results").css('display', 'none')
	if(listType == 'games'){
		$.ajax({
			type: "POST",
			url: "/getGameInfo",
			data: { 
			      id: $(e).find(".item_id").text(),
			      ListID: $(".list_id").text(),
			    },
			success: function(html){
				$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').html(html)
				$(e).parent().parent().parent().parent().get(0).selected = 1;
				setTimeout(function(){$('.autogrow', $(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').get(0)).each(function(){
					textAreaAdjust(this)
				})}, 0)
			}
		})
	}
	else{
		$(e).parent().parent().parent().parent().get(0).selected = 1;
		$(e).parent().siblings('.loading_container').find('paper-spinner').attr('active', 'false')
		//$(".add_title").attr('value', $(e).find(".find_title").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow .add_title').val($(e).find(".find_title").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children(".add_platform").attr('value', $(e).find(".find_platform").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children(".add_release_date").attr('value', $(e).find(".find_release_date").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children(".add_publisher").attr('value', $(e).find(".find_publisher").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children(".add_description_decorator").children(".add_description").val($(e).find(".find_description").text())
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow .add_image_url').val($(e).find(".art").attr("src"))
		$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow .add.art').attr('src', $(e).find(".art").attr("src"))
		$(".add_developer").attr('value', $(e).find(".find_developer").text())
		$(".add_author").val($(e).find(".find_author").text())
		$(".add_id").val($(e).find(".item_id").text())

		setTimeout(function(){$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow .autogrow').each(function(){
			textAreaAdjust(this)
		})}, 0)
	}
		setTimeout(function(){
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children('.add_end_date_decorator').get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow .add_title_decorator').get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children('.add_start_date_decorator').get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children(".add_description_decorator").get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children('.add_image_decorator').get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children('.add_author_decorator').get(0).querySelector('::shadow .floated-label').removeAttribute('invisible')
			
			
			$(e).parent().parent().parent().siblings('selection').find('.addNew_narrow').children('.add_end_date_decorator').find('.add_end_date').attr('value', "")
		}, 500)
		

    
}

function putItem(t, listType, listkey){
	$(t).parent().parent().parent().parent().siblings('.loading_container').find('paper-spinner').attr('active', 'true')
	$(document.getElementById('full_loading')).css('display', 'flex');
	$(document.getElementById('full_loading')).css('z-index', '1013');
	$(document.getElementById('full_loading')).find('paper-spinner').attr('active', 'true')
    put_url = '/put'
    if (listType == 'games'){
      put_url += "Game"
    }
    else if (listType == 'books'){
      put_url += "Book"
    }
    else{
      put_url += "Movie"
    }
    $.ajax({
      type: "POST",
      url: put_url,
      data: { ListID: listkey,
              Title: $(t).siblings('.add_title_decorator').children(".add_title").val(),
              Platform: $(t).siblings(".add_platform").attr('value'),
              Author: $(t).siblings('.add_author_decorator').children(".add_author").val(),
              Publisher: $(t).siblings(".add_publisher").attr('value'),
              ReleaseDate: $(t).siblings(".add_release_date").attr('value'),
              Developer: $(t).siblings(".add_developer").attr('value'),
              Description: $(t).siblings('.add_description_decorator').children(".add_description").val(),
              ImageUrl: $(t).siblings('.add_image_decorator').children(".add_image_url").val(),
              StartDate: $(t).siblings('.add_start_date_decorator').children(".add_start_date").val(),
              EndDate: $(t).siblings('.add_end_date_decorator').children(".add_end_date").val(),
              id: $(t).siblings(".add_id").val()
            },
      success: function(html){
        location.reload();
      }
    })
}

function viewItem(e, t, listType){
	$(document.getElementById('full_loading')).find('paper-spinner').attr('active', 'true')
	//alert($(t).children(".item_id").text() + ($(e.target).attr('class')) + $('.main_pages').get(0).selected)
	if($(e.target).attr('class') == 'art'){
		//$('body').css('overflow-y','hidden');
		$('#overlay').fadeIn('fast')
		$('.spinner').fadeIn('fast')
		view_url = '/view'
		if (listType == 'games'){
		  view_url += "Game"
		}
		else if (listType == 'books'){
		  view_url += "Book"
		}
		else{
		  view_url += "Movie"
		}
		$.ajax({
		  type: "GET",
		  url: "/viewItem?itemID="+$(t).children(".item_id").text()+"&listType="+listType,
		  success: function(html){
		    $( ".viewitem" ).html( html );
		    $('.main_pages').get(0).selected = 1
		    //$('#overlay').css('visibility', 'visible')
		  }
		})
	}
}

function finishItem(itemId){
	$('.finish_id').text(itemId)
	date = new Date()
	month = date.getMonth()+1
	strmonth = ''+month
	if(month < 10)
		strmonth = '0'+month
	$('.finish_end_date').val(date.getFullYear()+"-"+strmonth+"-"+date.getDate())
	$('#finish_item_dialog').get(0).toggle()
}



