#!/bin/bash

# Default values
output_file="${2:-output.jpg}"
num_colors="${3:-32}"
png_quality="${4:-50}"
png_range="${4:-40-50}"
jpg_quality="${4:-10}"

# Process the images
convert "$1" -colors $num_colors step_1.png
convert step_1.png -quality $png_quality step_2.png
pngquant --quality=$png_range step_2.png -o step_3.png
convert step_3.png -quality $jpg_quality "$output_file"
