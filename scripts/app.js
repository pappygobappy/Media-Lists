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
		var meta = document.createElement('core-meta');
    	meta.type = 'transition';
    	var transitionFade = meta.byId('core-transition-fade');
		setTimeout(function(){transitionFade.go($('#drawerPanel').get(0), {opened: false})}, 100)
		url = "/list?list_title="+$(this).find('#title').text()
		document.location.href = url
	
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

	container_size = Math.floor($(".list_card").width() / 60)
	$(".list_container").width(container_size * 60)
	$(".add_list_narrow").css("left", ($("core-scroll-header-panel").width()*0.05)+"px")
	$(window).resize(function() {
		//alert(Math.floor($(".content").width() / 170))
	    container_size = Math.floor($(".list_card").width() / 60)
	    $(".list_container").width(container_size * 60)
	    $(".add_list_narrow").css("left", ($("core-scroll-header-panel").width()*0.05)+"px")

	});
	


	$("#add_list_narrow").get(0).removeAttribute('hidden')

	$(".add_list").click(function(){
		if(!($("#drawerPanel").attr("narrow") == ""))
			document.getElementById('add_list_dialog').toggle()
		else{
			toggleHomeAdd()
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
    transition.setup(animated, add_list_narrow_state);
    transition2.setup($('.content').get(0), content_narrow_state)
    transition2.go($('.content').get(0), content_narrow_state);
    transitionFade.setup($('#drawerPanel').get(0), {opened: true})
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





