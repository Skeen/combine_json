var ls      = require('list-directory-contents');
var fs      = require('fs');
var options = require('commander');

options
  .version('0.0.1')
  .usage('[options] <startsWith>')
  .option('-q, --quiet', "Don't output to stdout")
  .option('-o, --output-file <file>', 'Output to specified file');

// Parse argv
options.parse(process.argv);

var start = options.args[0];
if(start == undefined)
{
    console.error();
    console.error("Fatal error: No startsWith provided");
    options.help();
}

var read_all = function(files, callback)
{
    var visit = function(car, cdr, acc, callback)
    {
        if(car == undefined)
            callback(acc);
        else
        {
            fs.readFile(car, 'utf8', function(err, data) 
            {
                if (err) 
                {
                    console.error(err);
                    process.exit(1);
                }
                var json;
                try
                {
                    json = JSON.parse(data);
                }
                catch(e)
                {
                    console.error(e);
                    process.exit(1);
                }
                // Accumulate
                var merged = [].concat.apply(acc, json);
                // Run the next file
                var car = files.shift();
                visit(car, files, merged, callback);
            });
        }
    }
    // Get the ball rolling
    var car = files.shift();
    visit(car, files, [], callback);
}

ls('./done', function(err, tree)
{
    if(err)
    {
        console.error(err);
        process.exit(1);
    }

    var filtered = tree.filter(function(element)
    {
        return element.startsWith(start);
    });

    //console.log(filtered);

    read_all(filtered, function(accum)
    {
        var stringified = JSON.stringify(accum);
        // Output to screen
        if(options.quiet != true)
        {
            console.log(stringified);
        }
        // Output to file if required to do so
        if(options.outputFile != undefined)
        {
            fs.writeFile(options.outputFile, stringified, function(err) 
            {
                if(err)
                {
                    console.error(err);
                    process.exit(1);
                }
            });
        }
     
    });
});

