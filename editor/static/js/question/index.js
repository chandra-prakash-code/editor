$(document).ready(function() {
    $('#newQuestion').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $('#newQuestion').hide();
        $('#newQuestionForm')
            .show()
            .css('display','inline-block')
            .find('input[name="name"]')
                .focus()
        ;
    });

    function cancelCreate() {
        $('#newQuestion').show();
        $('#newQuestionForm').hide();
    }

    $('#newQuestionForm')
        .hide()
        .submit(function(e) {
            var name = $(this).find('input[name="name"]').val();
            if(!name.trim().length)
            {
                e.preventDefault();
                e.stopPropagation();
            }
        })
        .find('input[name="name"]')
            .keyup(function(e) {
                if(e.which==27)
                    cancelCreate();
            })
    ;

    
    $('body').on('click','.question .delete',function(e) {
        e.stopPropagation();
        e.preventDefault();
        if(window.confirm('Delete this question?')) {
            var url = $(this).attr('href');
            var item = $(this).parents('.question');
            $.post(url,{csrfmiddlewaretoken: getCookie('csrftoken')})
                .success(function() {
                    item.slideUp(200,function() {item.remove()})
                })
                .error(function(response) {
                    noty({text: 'Error deleting question:\n\n'+response.responseText, layout: 'center', type: 'error'});
                })
            ;
        }
    });

    $('#question-list').tablesorter();

    $('#uploadButton').click(function(e) {
        e.preventDefault();
        $('#uploadForm input[type=file]').trigger('click');
    });
    $('#uploadForm input[type=file]').change(function(e) {
        $('#uploadForm').submit();
    });
        
    function QuestionSelect()
    {
		var e = this;

		this.search = {
			query: ko.observable(''),
			author: ko.observable(''),
			results: {
				all: ko.observableArray([]),
				page: ko.observable(1),
				prevPage: function() {
					var page = this.page();
					if(page>1)
						this.page(page-1);
				},
				nextPage: function() {
					var page = this.page();
					if(page<this.pages().length)
						this.page(page+1);
				}
			},
			searching: ko.observable(false),
			realMine: ko.observable(false),
			clearMine: function() {
				this.search.mine(false);
			}
		}
		this.search.results.pages = ko.computed(function() {
			this.page(1);

			var results = this.all();
			var pages = [];
			for(var i=0;results.length>0;i+=10) {
				pages.push(results.splice(0,10));
			}

			return pages;
		},this.search.results);
		this.search.results.pageText = ko.computed(function() {
			return this.page()+'/'+this.pages().length;
		},this.search.results);


		this.search.mine = ko.computed({
			read: function() {
				return this.realMine();
			},
			write: function(v) {
				this.realMine(v);
				if(v)
					this.author('');
			}
		},this.search);

		ko.computed(function() {
            var vm = this;
            this.search.searching(true);
			var data = {
				q: this.search.query(),
				author: this.search.author(),
				mine: this.search.mine()
			};
            $.getJSON('/question/search/',data)
                .success(function(data) {
                    vm.search.results.all(data.object_list);
                })
                .error(function() {
					if('console' in window)
	                    console.log(arguments);
                })
                .complete(function() {
                    vm.search.searching(false);
                });
            ;

		},this).extend({throttle:100});
    }
    
    //create a view model
    viewModel = new QuestionSelect();
    ko.applyBindings(viewModel);
    
});

