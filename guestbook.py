import os
import urllib
import logging
import time
import json
import unicodedata

from google.appengine.api import users, urlfetch
from google.appengine.ext import db, ndb
from google.appengine.api import users

import jinja2
import webapp2
import urllib2
from xml.etree import ElementTree

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

DEFAULT_GUESTBOOK_NAME = 'default_guestbook'

GAMES_ART_URL_START = 'http://thegamesdb.net/banners/boxart/original/front/'
GAMES_GET_ART_URL_START = 'http://thegamesdb.net/api/GetArt.php?id='
GAMES_INFO_URL_START = 'http://thegamesdb.net/api/GetGamesList.php?name='
GAME_INFO_URL_START = 'http://thegamesdb.net/api/GetGame.php?id='
BOOKS_INFO_URL_START = 'https://www.googleapis.com/books/v1/volumes'
BOOKS_ART_START = 'http://books.google.com/books/content?id='
BOOKS_ART_TAIL = '&printsec=frontcover&img=1&source=gbs_api'
MOVIES_INFO_URL_START = 'http://www.omdbapi.com/?t='
MOVIES_LIMIT = '3'

# We set a parent key on the 'Greetings' to ensure that they are all in the same
# entity group. Queries across the single entity group will be consistent.
# However, the write rate should be limited to ~1/second.

def guestbook_key(guestbook_name=DEFAULT_GUESTBOOK_NAME):
    """Constructs a Datastore key for a Guestbook entity with guestbook_name."""
    return ndb.Key('Guestbook', guestbook_name)


class Greeting(ndb.Model):
    """Models an individual Guestbook entry with author, content, and date."""
    author = ndb.UserProperty()
    content = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)

class Lists(db.Model):
    title = db.StringProperty()
    listType = db.StringProperty()
    listItems = db.ListProperty(db.Key)
    userid = db.StringProperty()

class ListItem(db.Model):
    title = db.StringProperty()
    imageUrl = db.StringProperty()
    listN = db.ReferenceProperty(Lists)
    description = db.TextProperty()
    startDate = db.StringProperty()
    finishDate = db.StringProperty()

class BookItem(ListItem):
    author = db.StringProperty()
    publisher = db.StringProperty()
    publishedDate = db.StringProperty()

class GameItem(ListItem):
    hoursPlayed = db.StringProperty()
    platform = db.StringProperty()
    releaseDate = db.StringProperty()
    publisher = db.StringProperty()
    developer = db.StringProperty()

class MovieItem(ListItem):
    dateWatched = db.StringProperty()
    yearMade = db.StringProperty()


class MyElement(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('test.html')
        self.response.write(template.render())

class MainPage(webapp2.RequestHandler):

    def get(self):
        lv = self.request.get('list_title')
        guestbook_name = self.request.get('guestbook_name',
                                          DEFAULT_GUESTBOOK_NAME)
        greetings_query = Greeting.query(
            ancestor=guestbook_key(guestbook_name)).order(-Greeting.date)
        greetings = greetings_query.fetch(10)
        nickname = ''
        user = users.get_current_user()
        if(user):
            nickname = user.nickname()
        else:
            nickname = users.create_login_url('/')

        lists = Lists.all()

        if users.get_current_user():
            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'
            lists.filter('userid = ', users.get_current_user().user_id())
        else:
            url = users.create_login_url(self.request.uri)
            url_linktext = 'Login'

        template_values = {
            'greetings': greetings,
            'guestbook_name': urllib.quote_plus(guestbook_name),
            'url': url,
            'url_linktext': url_linktext,
            'lists': lists,
            'lv': urllib.quote_plus(lv),
            'db': db,
            'user': nickname,
        }

        template = JINJA_ENVIRONMENT.get_template('test.html')
        self.response.write(template.render(template_values))


class Guestbook(webapp2.RequestHandler):

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        l = Lists(title = self.request.get('content'), listType = self.request.get('type'))
        l.put()
        guestbook_name = self.request.get('guestbook_name',
                                          DEFAULT_GUESTBOOK_NAME)
        greeting = Greeting(parent=guestbook_key(guestbook_name))

        if users.get_current_user():
            greeting.author = users.get_current_user()

        greeting.content = self.request.get('content')
        greeting.put()

        query_params = {'guestbook_name': guestbook_name}
        self.redirect('/?' + urllib.urlencode(query_params))

class AddList(webapp2.RequestHandler):
    def post(self):
        list_title = self.request.get('ListTitle')
        list_type = self.request.get('ListType')
        l = Lists(title = list_title, listType = list_type, userid = users.get_current_user().user_id())
        l.put()
        lists = Lists.all()
        self.response.write("added")

class ListView(webapp2.RequestHandler):
    def get(self):
        list_title = self.request.get('list_title')
        lq = Lists.all()
        lq.filter("title =", list_title).filter("userid = ", users.get_current_user().user_id())
        
        listToView = Lists()
        for l in lq:
            listToView = l
        finishedCount = 0
        for li in listToView.listItems:
            if db.get(li).finishDate != '':
                finishedCount += 1
        startCount = 0
        for li in listToView.listItems:
            if db.get(li).finishDate == '':
                startCount += 1
        list_title = list_title.replace("'", "\'")
        template_values = {
            'listToView': listToView,
            'finishedCount': str(finishedCount),
            'startCount': str(startCount),
            'totalPlayed': str(len(listToView.listItems)),
            'db': db,
            'user': users.get_current_user(),
        }

        template = JINJA_ENVIRONMENT.get_template('list_view.html')
        self.response.write(template.render(template_values))

class PutMovie(webapp2.RequestHandler):

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_id = self.request.get('ListID')
        listToView = Lists.get_by_id(int(list_id))
        movie_title = self.request.get('Title')
        movie_end = self.request.get('EndDate')
        movie_des = self.request.get("Description")
        movie_release = self.request.get("ReleaseDate")
        movie_image_url = self.request.get("ImageUrl")
        movie_id = ""
        movie = MovieItem(title=movie_title, 
                        dateWatched=movie_end, 
                        imageUrl=movie_image_url, 
                        description=movie_des, 
                        releaseDate=movie_release,
                        listN=listToView)
        movie.put()
        listToView.listItems.append(movie.key())
        listToView.put()

        template_values = {
            'listToView': listToView,
            'db': db,
            'game_id': str(movie_id),
        }

        template = JINJA_ENVIRONMENT.get_template('listview.html')
        self.response.write(template.render(template_values))

class PutGame(webapp2.RequestHandler):

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_id = self.request.get('ListID')
        listToView = Lists.get_by_id(int(list_id))
        game_title = self.request.get('Title')
        game_start = self.request.get('StartDate')
        game_end = self.request.get('EndDate')
        game_platform = self.request.get('Platform')
        game_des = self.request.get("Description")
        game_publisher = self.request.get("Publisher")
        game_developer = self.request.get("Developer")
        game_release = self.request.get("ReleaseDate")
        game_image_url = self.request.get("ImageUrl")
        game_id = ""
        game = GameItem(title=game_title, 
                        startDate=game_start, 
                        finishDate=game_end, 
                        imageUrl=game_image_url, 
                        description=game_des, 
                        platform=game_platform,
                        releaseDate=game_release,
                        publisher=game_publisher,
                        developer=game_developer,
                        listN=listToView)
        game.put()
        listToView.listItems.append(game.key())
        listToView.put()

        template_values = {
            'listToView': listToView,
            'db': db,
            'game_id': str(game_id),
            'game_url': game_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('listview.html')
        self.response.write(template.render(template_values))

class PutBook(webapp2.RequestHandler):

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_id = self.request.get('ListID')
        listToView = Lists.get_by_id(int(list_id))
        book_title = self.request.get('Title')
        book_start = self.request.get('StartDate')
        book_end = self.request.get('EndDate')
        book_author = self.request.get('Author')
        book_description = self.request.get("Description")
        book_publisher = self.request.get("Publisher")
        book_published_date = self.request.get("ReleaseDate")
        book_image_url = self.request.get("ImageUrl")
        item_id = "/"+self.request.get('id')

        response = urlfetch.fetch(url=BOOKS_INFO_URL_START+item_id, method=urlfetch.GET)
        data = json.loads(str(response.content))
        book_description = data["volumeInfo"]["description"].encode('ascii', 'ignore')
        #book_description = unicodedata.normalize('NFKD', book_description).encode('ascii', 'ignore')


        book = BookItem(title=book_title, 
                        startDate=book_start, 
                        finishDate=book_end, 
                        imageUrl=book_image_url, 
                        description=book_description, 
                        author=book_author,
                        publishedDate=book_published_date,
                        publisher=book_publisher,
                        listN=listToView)
        book.put()
        listToView.listItems.append(book.key())
        listToView.put()

        template_values = {
            'listToView': listToView,
            'db': db,
            'game_id': str(item_id),
            'game_url': book_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('listview.html')
        self.response.write(template.render(template_values))

class FindBook(webapp2.RequestHandler):
    def post(self):
        book_title = self.request.get('Title')
        book_author = self.request.get('Author')
        list_type = self.request.get('list_type')
        book_url_title = book_title.replace(" ", "%20")
        book_url_author = book_author.replace(" ", "%20")
        book_url_title = "?q="+book_url_title
        if(book_url_author != ''):
            book_url_title = book_url_title+"%20inauthor:"+book_url_author
        apicall = BOOKS_INFO_URL_START+book_url_title
        response = urlfetch.fetch(url=BOOKS_INFO_URL_START+book_url_title, method=urlfetch.GET)
        data = json.loads(str(response.content))

        template_values = {
            'BOOKS_ART_URL_START': BOOKS_ART_START,
            'BOOKS_ART_URL_TAIL': BOOKS_ART_TAIL,
            'data': data,
            'book_title': str(book_title),
            'list_type': list_type,
            #'game_url': game_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('searchbookresults.html')
        self.response.write(template.render(template_values))

class AddNewItem(webapp2.RequestHandler):
    def post(self):
        list_type= self.request.get('list_type')
        template_values = {
            'list_type': list_type,
        }

        template = JINJA_ENVIRONMENT.get_template('addnewitem.html')
        self.response.write(template.render(template_values))

class FindGame(webapp2.RequestHandler):
    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_title = self.request.get('list_title')
        lq = Lists.all()
        lq.filter("title =", list_title)
        listToView = Lists()
        for l in lq:
            listToView = l
        list_type = self.request.get('list_type')
        game_title = self.request.get('Title')
        game_start = self.request.get('StartDate')
        game_end = self.request.get('EndDate')
        game_platform = self.request.get('Platform')

        game_url_title = game_title.replace(" ", "%20")
        game_url_platform = game_platform.replace(" ", "%20")
        apicall = GAMES_INFO_URL_START+game_url_title
        if game_platform != '':
            apicall = apicall+'&platform='+game_url_platform
        response = urlfetch.fetch(url=GAMES_INFO_URL_START+game_url_title+'&platform='+game_url_platform, method=urlfetch.GET)
        tree = ElementTree.fromstring(response.content)

        template_values = {
            'GAMES_ART_URL_START': GAMES_ART_URL_START,
            'tree': tree,
            'game_title': str(game_title),
            'list_type': list_type,
            #'game_url': game_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('searchgameresults.html')
        self.response.write(template.render(template_values))

class FindMovie(webapp2.RequestHandler):
    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_title = self.request.get('list_title')
        lq = Lists.all()
        lq.filter("title =", list_title)
        listToView = Lists()
        for l in lq:
            listToView = l
        list_type = self.request.get('list_type')
        movie_title = self.request.get('Title')
        game_start = self.request.get('StartDate')
        game_end = self.request.get('EndDate')
        game_platform = self.request.get('Platform')

        movie_url_title = movie_title.replace(" ", "%20")
        game_url_platform = game_platform.replace(" ", "%20")
        apicall = MOVIES_INFO_URL_START+movie_url_title
        if game_platform != '':
            apicall = apicall+'&platform='+game_url_platform
        response = urlfetch.fetch(url=apicall+'&plot=full&r=json', method=urlfetch.GET)
        data = json.loads(str(response.content))

        template_values = {
            'GAMES_ART_URL_START': GAMES_ART_URL_START,
            'movie': data,
            'game_title': str(movie_title),
            'list_type': list_type,
            #'game_url': game_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('searchmovieresults.html')
        self.response.write(template.render(template_values))

class GetGameInfo(webapp2.RequestHandler):
    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each Greeting
        # is in the same entity group. Queries across the single entity group
        # will be consistent. However, the write rate to a single entity group
        # should be limited to ~1/second.
        list_type = self.request.get('list_type')
        list_id = self.request.get('ListID')
        listToView = Lists.get_by_id(int(list_id))
        game_title = self.request.get('id')
        apicall = GAME_INFO_URL_START+game_title
        response = urlfetch.fetch(url=apicall, method=urlfetch.GET)
        tree = ElementTree.fromstring(response.content)

        template_values = {
            'GAMES_ART_URL_START': GAMES_ART_URL_START,
            'tree': tree,
            'game_title': str(game_title),
            'list_type': 'games',
            'listToView': listToView,
            #'game_url': game_image_url,
        }

        template = JINJA_ENVIRONMENT.get_template('addGameInfo.html')
        self.response.write(template.render(template_values))
        

class CompleteGame(webapp2.RequestHandler):
    def post(self):
        item_id = self.request.get('ItemID')
        item = GameItem()
        item = GameItem.get_by_id(int(item_id))
        item.finishDate = ''
        item.finishDate = time.strftime("%x")
        item.put()
        self.response.write("woo")

class CompleteBook(webapp2.RequestHandler):
    def post(self):
        item_id = self.request.get('ItemID')
        item = BookItem()
        item = BookItem.get_by_id(int(item_id))
        item.finishDate = ''
        item.finishDate = time.strftime("%x")
        item.put()
        self.response.write("woo")

class ViewGame(webapp2.RequestHandler):
    def get(self):
        item_id = self.request.get('itemID')
        item = GameItem()
        item = GameItem.get_by_id(int(item_id))
        template_values = {
            'game': item,
            'game_id': item_id,
        }

        template = JINJA_ENVIRONMENT.get_template('gameview.html')
        self.response.write(template.render(template_values))

class ViewBook(webapp2.RequestHandler):
    def get(self):
        item_id = self.request.get('itemID')
        item = BookItem()
        item = BookItem.get_by_id(int(item_id))
        template_values = {
            'book': item,
            'description': item.description,
            'book_id': item_id,
        }

        template = JINJA_ENVIRONMENT.get_template('bookview.html')
        self.response.write(template.render(template_values))

class ViewItem(webapp2.RequestHandler):
    def get(self):
        item_id = self.request.get('itemID')
        listType = self.request.get('listType')
        if(listType == 'games'):
            item = GameItem.get_by_id(int(item_id))
        elif(listType == 'books'):
            item = BookItem.get_by_id(int(item_id))
        else:
            item = MovieItem.get_by_id(int(item_id))

        template_values = {
            'item': item,
            'listType': listType,
        }

        template = JINJA_ENVIRONMENT.get_template('itemview.html')
        self.response.write(template.render(template_values))



application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/sign', Guestbook),
    ('/list', ListView),
    ('/addNewItem', AddNewItem),
    ('/putGame', PutGame),
    ('/putBook', PutBook),
    ('/putMovie', PutMovie),
    ('/findGame', FindGame),
    ('/findBook', FindBook),
    ('/findMovie', FindMovie),
    ('/completeGame', CompleteGame),
    ('/completeBook', CompleteBook),
    ('/viewGame', ViewGame),
    ('/viewBook', ViewBook),
    ('/viewItem', ViewItem),
    ('/addList', AddList),
    ('/getGameInfo', GetGameInfo),
    ('/my-element', MyElement),
], debug=True)
