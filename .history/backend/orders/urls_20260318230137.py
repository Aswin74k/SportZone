from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet

Exception in thread django-main-thread:
Traceback (most recent call last):
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\threading.py", line 1082, in _bootstrap_inner  
    self._context.run(self.run)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\threading.py", line 1024, in run
    self._target(*self._args, **self._kwargs)
    ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\utils\autoreload.py", line 64, in wrapper
    fn(*args, **kwargs)
    ~~^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\management\commands\runserver.py", line 134, in inner_run
    self.check(**check_kwargs)
    ~~~~~~~~~~^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\management\base.py", line 496, in check
    all_issues = checks.run_checks(
        app_configs=app_configs,
    ...<2 lines>...
        databases=databases,
    )
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\checks\registry.py", line 89, in run_checks
    new_errors = check(app_configs=app_configs, databases=databases)
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\checks\urls.py", line 136, in check_custom_error_handlers
    handler = resolver.resolve_error_handler(status_code)
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\resolvers.py", line 743, in resolve_error_handler
    callback = getattr(self.urlconf_module, "handler%s" % view_type, None)
                       ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\utils\functional.py", line 47, in __get__
    res = instance.__dict__[self.name] = self.func(instance)
                                         ~~~~~~~~~^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\resolvers.py", line 722, in urlconf_module
    return import_module(self.urlconf_name)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\sportzone\urls.py", line 27, in <module>
    path('api/', include('orders.urls')),
                 ~~~~~~~^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\conf.py", line 39, in include
    urlconf_module = import_module(urlconf_module)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\orders\urls.py", line 3, in <module>
    from .views import CartViewSet, OrderViewSet
  File "C:\Users\HP\Desktop\sportZone\backend\orders\views.py", line 3, in <module>
    class CartViewSet(viewsets.ModelViewSet):
                      ^^^^^^^^
NameError: name 'viewsets' is not defined
C:\Users\HP\Desktop\sportZone\backend\orders\views.py changed, reloading.
Watching for file changes with StatReloader
Performing system checks...

Exception in thread django-main-thread:
Traceback (most recent call last):
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\checks\urls.py", line 136, in check_custom_error_handlers
    handler = resolver.resolve_error_handler(status_code)
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\resolvers.py", line 743, in resolve_error_handler
    callback = getattr(self.urlconf_module, "handler%s" % view_type, None)
                       ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\utils\functional.py", line 47, in __get__
    res = instance.__dict__[self.name] = self.func(instance)
                                         ~~~~~~~~~^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\resolvers.py", line 722, in urlconf_module
    return import_module(self.urlconf_name)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\sportzone\urls.py", line 27, in <module>
    path('api/', include('orders.urls')),
                 ~~~~~~~^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\conf.py", line 39, in include
    urlconf_module = import_module(urlconf_module)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\orders\urls.py", line 3, in <module>
    from .views import CartViewSet, OrderViewSet
ImportError: cannot import name 'OrderViewSet' from 'orders.views' (C:\Users\HP\Desktop\sportZone\backend\orders\views.py)

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\threading.py", line 1082, in _bootstrap_inner
    self._context.run(self.run)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\threading.py", line 1024, in run
    self._target(*self._args, **self._kwargs)
    ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\utils\autoreload.py", line 64, in wrapper
    fn(*args, **kwargs)
    ~~^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\management\commands\runserver.py", line 134, in inner_run
    self.check(**check_kwargs)
    ~~~~~~~~~~^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\management\base.py", line 496, in check
    all_issues = checks.run_checks(
        app_configs=app_configs,
    ...<2 lines>...
        databases=databases,
    )
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\checks\registry.py", line 89, in run_checks
    new_errors = check(app_configs=app_configs, databases=databases)
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\core\checks\urls.py", line 138, in check_custom_error_handlers
    path = getattr(resolver.urlconf_module, "handler%s" % status_code)
                   ^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\utils\functional.py", line 47, in __get__
    res = instance.__dict__[self.name] = self.func(instance)
                                         ~~~~~~~~~^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\resolvers.py", line 722, in urlconf_module
    return import_module(self.urlconf_name)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\sportzone\urls.py", line 27, in <module>
    path('api/', include('orders.urls')),
                 ~~~~~~~^^^^^^^^^^^^^^^
  File "C:\Users\HP\Desktop\sportZone\backend\venv\Lib\site-packages\django\urls\conf.py", line 39, in include 
    urlconf_module = import_module(urlconf_module)
  File "C:\Users\HP\AppData\Local\Python\pythoncore-3.14-64\Lib\importlib\__init__.py", line 88, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1398, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1371, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1342, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 938, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 759, in exec_module
  File "<frozen importlib._bootstrap>", line 491, in _call_with_frames_removed
  File "C:\Users\HP\Desktop\sportZone\backend\orders\urls.py", line 3, in <module>
    from .views import CartViewSet, OrderViewSet
ImportError: cannot import name 'OrderViewSet' from 'orders.views' (C:\Users\HP\Desktop\sportZone\backend\orders\views.py)


router = DefaultRouter()
router.register(r'cart', CartViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]