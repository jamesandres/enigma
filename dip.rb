#!/usr/bin/env ruby

cipherFrequency = {}
plainFrequency = {}
total = 0

('A'..'Z').each do |chr|
  cipherFrequency[chr] = 0
  plainFrequency[chr] = 0
end

File.open("dip.cipher.txt", "r") do |file|
  while (chr = file.read(1)) do
    cipherFrequency[chr] = cipherFrequency[chr] + 1 rescue 0
    total += 1
  end
end

File.open("dip.plain.txt", "r") do |file|
  while (chr = file.read(1)) do
    plainFrequency[chr] = plainFrequency[chr] + 1 rescue 0
  end
end

cipherFrequency.each do |chr, num|
  cipherLength = (num.to_f / total.to_f * 800).to_i
  plainLength = (plainFrequency[chr].to_f / total.to_f * 300).to_i

  printf "%s: %50s %50s\n", chr, '#' * cipherLength, '#' * plainLength
end
