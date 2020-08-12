# Progress Wrapper

![Demo Progress Application](https://raw.githubusercontent.com/Crystalix007/progress-wrapper/assets/progress-demo-screenshot.png)

## What?

This just wraps any commandline application capable of spewing out `Progress:
x%`, in either its `stdout` or `stderr`, and adds a nicer web interface.

## Why?

I wanted the ability to see the progress and output of long-running commands and
there didn't seem to be an existing wrapper which *just worked* like this.

## How?

You can clone with `git`, then `npm install` in the root directory to install
the `Node` modules.

Then, running `node . 'my long running command . here'`, should spew out a link
to click on.

With any luck you should have a relatively quickly-updating view of the
progress, `stdout` and `stderr` streams.

## Contributions

Hey! This project uses
[Commitizen (the Python version)](https://github.com/commitizen-tools/commitizen).

Commits should be made in this format. If you want to make sure you follow the
format, just install the `commitizen` tool, and run `cz commit` in the root
folder. Since Commitizen doesn't currently wrap long commit lines, you don't
need to worry about that.

Also, part of the appeal is having minimal dependencies, so if something can be
added without adding dependencies, the more the better.

Finally, any resources should be able to be fetched locally, i.e. directly from
the device hosting this wrapper. Requiring internet access makes this a lot more
cumbersome for applications where a connection to the internet is more
difficult.
