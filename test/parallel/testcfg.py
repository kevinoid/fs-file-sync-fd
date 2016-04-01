import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import testpy

# fs-file-sync-fd change:  Preload fs-file-sync-fd functions into the fs module.
# By doing this, the Node.js tests can be used without modification.
PRELOAD_PATH = os.path.join(os.path.dirname(__file__), '..', 'preload-fs-file-sync-fd.js')
PRELOAD_PATH = os.path.normpath(PRELOAD_PATH)
EXTRA_ARGS = ['-r', PRELOAD_PATH]

def GetConfiguration(context, root):
  return testpy.ParallelTestConfiguration(context, root, 'parallel', EXTRA_ARGS)
